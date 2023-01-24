import neo4jDriver from '../../utils/neo4jDriver.js';
// import {Date as Neo4jDate} from 'neo4j-driver-core/lib/temporal-types.js';
import argon2 from 'argon2';
import * as uuid from 'uuid';


class AuthService {
	constructor(neo4jDriver) {
		this.neo4jDriver = neo4jDriver;
		this.sessions;
		// Szybki skrypt na wygenerowanie danych logowania dla istniejących użytkowników
		// (async () => {
		// 	const neo4jSession = this.neo4jDriver.session();
		// 	const existingUsers = (await neo4jSession.run('MATCH (u:User) RETURN u')).records.map(record => record.get('u').properties);
		// 	console.log(existingUsers);
		// 	for (const user of existingUsers) {
		// 		const password = "user";
				
				
		// 		// console.log(user.username, email, password, hashedPassword);
				


		// 		const email = user.contactEmail;
		// 		const hash = await argon2.hash(password);
		// 		// create UserCredentials with relationship to User
		// 		const result = await neo4jSession.run(
		// 			`
		// 				MATCH (u:User {id: $id})
		// 				CREATE (u)-[:HAS_CREDENTIALS]->(uc:UserCredentials {email: $email, hash: $hash})
		// 				RETURN uc
		// 			`,
		// 			{
		// 				id: user.id,
		// 				email,
		// 				hash
		// 			}
		// 		);
		// 	}
		// 	neo4jSession.close();

		// })();
	}
	generateToken() {
		return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
	};

	async register(
		{	id, 
			username, 
			password, 
			contactEmail, 
			firstName, 
			lastName, 
			dateOfBirth, 
			profilePictureUrl,
			dateOfJoin
		}
	){
		const neo4jSession = this.neo4jDriver.session();

		const accountWithEmailExists = await neo4jSession.run(
			`
				MATCH (u:UserCredentials {email: $contactEmail})
				RETURN u
			`,
			{
				contactEmail
			}
		);

		if (accountWithEmailExists.records.length !== 0) {
			neo4jSession.close();
			throw new Error('AccountWithEmailExists');
		}

		const isUsernameTaken = await neo4jSession.run(
			`
				MATCH (u:User {username: $username})
				RETURN u
			`,
			{
				username
			}
		);

		if (isUsernameTaken.records.length !== 0) {
			neo4jSession.close();
			throw new Error('UsernameIsAlreadyTaken');
		}

		console.log(`Adding user ${username} to database.`);
		const hash = await argon2.hash(password);
		const createUserResult = await neo4jSession.run(
			`
				CREATE (u:User {
					id: $id,
					firstName: $firstName,
					lastName: $lastName,
					username: $username,
					dateOfBirth: $dateOfBirth,
					profilePictureUrl: $profilePictureUrl,
					contactEmail: $contactEmail,
					followedBy: $followedBy,
					following: $following,
					dateOfJoin: $dateOfJoin
				})-[:HAS_CREDENTIALS]->(uc:UserCredentials {email: $email, hash: $hash})
				RETURN u
			`,
			{
				id: id,
				firstName: firstName,
				lastName: lastName,
				username: username,
				dateOfBirth: dateOfBirth,
				profilePictureUrl: profilePictureUrl,
				contactEmail: contactEmail,
				email: contactEmail,
				hash: hash,
				followedBy: [],
				following: [],
				dateOfJoin: dateOfJoin
			}
		);
		const user = createUserResult.records[0].get('u').properties;
		neo4jSession.close();
		return user;
	}

	async login({email, password}) {

		const neo4jSession = this.neo4jDriver.session();

		const result = await neo4jSession.run(
			`
				MATCH (u:User)-[:HAS_CREDENTIALS]->(uc:UserCredentials {email: $email})
				RETURN u, uc
			`,
			{
				email
			}
		);

		if (result.records.length === 0) {
			neo4jSession.close();
			// Fake delay
			await new Promise(resolve => setTimeout(resolve, Math.random() * 1010));
			throw new Error('InvalidEmailOrPassword');
		}

		const uc = result.records[0].get('uc').properties;

		const user = result.records[0].get('u').properties;

		const passwordValid = await argon2.verify(uc.hash, password);

		if (!passwordValid) {
			neo4jSession.close();
			await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
			throw new Error('InvalidEmailOrPassword');
		}

		const token = this.generateToken();
	
		const result2 = await neo4jSession.run(
			`
				MATCH (u:User {id: $id})
				CREATE (u)-[:HAS_SESSION]->(s:Session {token: $token, id: $sessionId})
				RETURN s
			`,
			{
				id: user.id,
				token,
				sessionId: uuid.v4()
			}
		);
		const session = result2.records[0].get('s').properties;
		neo4jSession.close();
		
		return {
			session,
			user,
		};
	}

	async me({sessionToken, sessionId}) {
		const neo4jSession = this.neo4jDriver.session();
		const result = await neo4jSession.run(
			`
				MATCH (u:User)-[:HAS_SESSION]->(s:Session {token: $token, id: $sessionId})
				RETURN u
			`,
			{
				token: sessionToken,
				sessionId
			}
		);
		neo4jSession.close();
		if (result.records.length === 0) {
			throw new Error('InvalidSession');
		}
		const user = result.records[0].get('u').properties;
		return user;
	}

	async logout({sessionToken, sessionId}) {
		const neo4jSession = this.neo4jDriver.session();
		const result = await neo4jSession.run(
			`
				MATCH (u:User)-[r:HAS_SESSION]->(s:Session {token: $token, id: $sessionId})
				DETACH DELETE s
			`,
			{
				token: sessionToken,
				sessionId
			}
		);
		neo4jSession.close();
		if (result.summary.counters.relationshipsDeleted === 0) {
			throw new Error('InvalidSession');
		}
		return true;
	}
}

const authService = new AuthService(neo4jDriver);

export default authService;
