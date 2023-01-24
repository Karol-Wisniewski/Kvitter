import neo4jDriver from '../../utils/neo4jDriver.js';


class UsersService {

	constructor(neo4jDriver) {
		this.neo4jDriver = neo4jDriver;
	}

	async getAll() {
		const session = this.neo4jDriver.session();
		const result = await session.run('MATCH (u:User) RETURN u');
		const users = result.records.map((record) => {
			return record.get('u').properties;
		});
		session.close();
		return users;
	}

	async getById(id) {
		const session = this.neo4jDriver.session();
		// const result = await session.run('MATCH (u:User) WHERE u.id = $id RETURN u', {id});
		const result = await session.run('MATCH (u:User {id: $id}) RETURN u', {id});
		const user = result.records[0].get('u').properties;
		session.close();
		return user;
	}

	async searchForUserByNameOrUsernameOrSurname({search}) {
		const session = this.neo4jDriver.session();
		const result = await session.run(
			`
				OPTIONAL MATCH (u:User)
				WHERE toLower(u.username) CONTAINS toLower($search) OR toLower(u.firstName) CONTAINS toLower($search) OR toLower(u.lastName) CONTAINS toLower($search)
				RETURN u
			`, 
			{
				search
			}
		);

		const users = result.records?.map((record) => {
			return record.get('u')?.properties
		});

		session.close();

		return users;
	}

	async searchForUserByNameAndSurname({search_opt_name, search_opt_surname}) {
		const session = this.neo4jDriver.session();
		const result = await session.run(
			`
				OPTIONAL MATCH (u:User)
				WHERE toLower(u.firstName) CONTAINS toLower($search_opt_name) AND toLower(u.lastName) CONTAINS toLower($search_opt_surname)
				RETURN u
			`, 
			{
				search_opt_name,
				search_opt_surname
			}
		);

		const users = result.records?.map((record) => {
			return record.get('u')?.properties
		});

		session.close();

		return users;
	}

	async getFollowedUsers(userId) {
		const session = this.neo4jDriver.session();
		const result = await session.run(
			`
				OPTIONAL MATCH (u:User)
				WHERE $userId IN u.followedBy
				RETURN u
			`,
			{
				userId
			}
		);
		const followingUsers = result.records?.map((record) => {
			return record.get('u')?.properties
		});
		session.close();
		return followingUsers;
	}

	async getFollowingUsers(userId) {
		const session = this.neo4jDriver.session();
		const result = await session.run(
			`
				OPTIONAL MATCH (u:User)
				WHERE $userId IN u.following
				RETURN u
			`,
			{
				userId
			}
		);
		const followers = result.records?.map((record) => {
			return record.get('u')?.properties
		});
		session.close();
		return followers;
	}

	async deleteById(id) {
		const session = this.neo4jDriver.session();
		const result = await session.run(
			`
				MATCH (u:User {id: $id})-[:HAS_CREDENTIALS]->(uc:UserCredentials)
				MATCH (u:User {id: $id})-[:HAS_SESSION]->(s:Session)
				OPTIONAL MATCH (t:Tweet)-[:CREATED_BY]->(tc:TweetCreator {userId: $id})
				OPTIONAL MATCH (t:Tweet)-[l:COMMENTED]->(c:Comment {commenterId: $id})
				DETACH DELETE u, uc, t, tc, s, l, c
			`, 
			{
				id
			}
		);
		session.close();
	}

	async updateById(
		{
			id,
			contactEmail,
			username,
			firstName,
			lastName,
			profilePictureUrl
		}
	) {
		const session = this.neo4jDriver.session();

		console.log("CHANGING USER DATA TO:")
		console.log(`id: ${id}`)
		console.log(`contactEmail: ${contactEmail}`)
		console.log(`username: ${username}`)
		console.log(`firstName: ${firstName}`)
		console.log(`lastName: ${lastName}`)

		const checkEmail = await session.run(
			`
				MATCH (u:User {contactEmail: $contactEmail})
				WHERE u.id <> $id
				RETURN u
			`,
			{
				contactEmail,
				id
			}
		);

		if (checkEmail.records.length !== 0) {
			session.close();
			throw new Error('AccountWithEmailExists');
		}

		const checkUsername = await session.run(
			`
				MATCH (u:User {username: $username})
				WHERE u.id <> $id
				RETURN u
			`,
			{
				username,
				id
			}
		);

		if (checkUsername.records.length !== 0) {
			session.close();
			throw new Error('AccountWithUsernameExists');
		}

		const result = await session.run(
			`
				MATCH (u:User {id: $id})-[:HAS_CREDENTIALS]->(uc:UserCredentials)
				OPTIONAL MATCH (t:Tweet)-[:CREATED_BY]->(tc:TweetCreator {userId: $id})
				OPTIONAL MATCH (c:Comment {commenterId: $id})
				SET u.contactEmail = $contactEmail
				SET u.username = $username
				SET u.firstName = $firstName
				SET u.lastName = $lastName
				SET u.profilePictureUrl = $profilePictureUrl
				SET uc.email = $contactEmail
				SET tc.username = $username
				SET tc.firstName = $firstName
				SET tc.lastName = $lastName
				SET tc.authorProfilePicture = $profilePictureUrl
				SET c.commenterFirstName = $firstName
				SET c.commenterLastName = $lastName
				SET c.commenterProfilePicture = $profilePictureUrl
			`,
			{
				id,
				contactEmail,
				username,
				firstName,
				lastName,
				profilePictureUrl
			}
		);

		session.close();
		
	}

	async followByIds({followerId, followingId}) {
		const session = this.neo4jDriver.session();

		const result = await session.run(
			`
				MATCH (u:User {id: $followerId}), (u1:User {id: $followingId})
				CREATE (u)-[r:FOLLOWS]->(u1)
				SET u.following = $followingId + u.following
				SET u1.followedBy = $followerId + u1.followedBy
			`, 
			{
				followerId,
				followingId
			}
		);

		session.close();

	}

	async unfollowByIds({followerId, followingId}) {
		const session = this.neo4jDriver.session();

		const result = await session.run(
			`
				MATCH (u:User {id: $followerId})-[r:FOLLOWS]->(u1:User {id: $followingId})
				DETACH DELETE r
				SET u.following = [x IN u.following WHERE x <> $followingId]
				SET u1.followedBy = [x IN u1.followedBy WHERE x <> $followerId]
			`, 
			{
				followerId,
				followingId
			}
			);

		session.close();
	}

	async deleteProfilePicture({id}) {
		const session = this.neo4jDriver.session();

		const result = await session.run(
			`
				MATCH (u:User {id: $id})
				OPTIONAL MATCH (:Tweet)-[:COMMENTED]-(c:Comment {commenterId: $id})
				OPTIONAL MATCH (t:Tweet)-[:CREATED_BY]->(tc:TweetCreator {userId: $id})
				SET u.profilePictureUrl = ""
				SET c.commenterProfilePicture = ""
				SET tc.authorProfilePicture = ""
			`, 
			{
				id
			}
			);

		session.close();

	}

}

const usersService = new UsersService(neo4jDriver);

export default usersService;
