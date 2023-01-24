import neo4jDriver from "../src/utils/neo4jDriver.js";
import * as uuid from "uuid";
import {Date as Neo4jDate} from 'neo4j-driver-core/lib/temporal-types.js'

/*
UUID = String

User {
	id: UUID UNIQUE,
	contactEmail: String, //Default: userCredentials.email
	username: String UNIQUE,
	firstName: String,
	lastName: String,
	profilePictureUrl: String //Default: https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png
    dateOfBirth: Date
}

(User)-[LIKES]->(Post)
(User)-[FOLLOWS]->(User)

Post {
	id: UUID UNIQUE,
}
(Post)-[CREATED_BY]->(User)

UserCredentials {
	id: UUID UNIQUE,
	email: String,
	hashedPassword: String,
}

(UserCredentials)-[OWNED_BY]->(User)

*/


// Hardcoding of random users for testing.

const randomChoose = (array) => {
	return array[Math.floor(Math.random() * array.length)];
};

const firstNames = [
	"Robert",
	"Kamil",
	"Krzysztof",
	"Kacper",
	"Jakub",
	"Marcin",
	"Mateusz",
	"Michał",
	"Patryk",
	"Adam",
	"Daniel",
	"Artur",
	"Karol",
	"Sebastian",
];

const lastNames = [
	"Nowak",
	"Michalak",
	"Kubica",
	"Kowalski",
	"Walewski",
	"Szemioto",
	"Pietras",
	"Zaleski",
	"Malinowski",
];

const generateFirstName = () => {
	return randomChoose(firstNames);
};

const generateLastName = () => {
	return randomChoose(lastNames);
};

const generateUsername = (firstName, lastName) => {
	if (Math.random() < 0.5) {
		return firstName.slice(0, 3) + lastName.slice(0, 3);
	} else {
		return firstName.slice(0, 3) + lastName.slice(0, 3) + Math.floor(Math.random() * 100);
	}
};

const generateDateOfBirth = () => {
	const year = Math.floor(Math.random() * 50) + 1970;
	const month = Math.floor(Math.random() * 12) + 1;
	const day = Math.floor(Math.random() * 28) + 1;
	return new Date(year, month, day);
};

const generateProfilePictureUrl = () => {
	return "https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png";
};

const emailDomains = [
	"gmail.com",
	"outlook.com",
	"yahoo.com",
];

const generateContactEmail = (username) => {
	const domain = randomChoose(emailDomains);
	return username + "@" + domain;
};


const generateUser = () => {
	const id = uuid.v4();
	const firstName = generateFirstName();
	const lastName = generateLastName();
	const username = generateUsername(firstName, lastName);
	const dateOfBirth = generateDateOfBirth();
	const profilePictureUrl = generateProfilePictureUrl();
	const contactEmail = generateContactEmail(username);
	return {
		id,
		firstName,
		lastName,
		username,
		dateOfBirth,
		profilePictureUrl,
		contactEmail,
	};
};

const generateUsers = (usersCount) => {
	const users = [];
	for (let i = 0; i < usersCount; i++) {
		users.push(generateUser());
	}
	return users;
}

const usersToGenerate = 20;

const users = generateUsers(usersToGenerate);

const session = neo4jDriver.session();

await session.run("MATCH (n) DETACH DELETE n"); //Deleting all users from database.
await session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE"); //Forcing a record to be unique.
await session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE"); //Forcing a record to be unique.
await session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.id IS NOT NULL"); //Forcing a record not to be null.
await session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.username IS NOT NULL"); //Forcing a record not to be null.
await session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.firstName IS NOT NULL"); //Forcing a record not to be null.
await session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.lastName IS NOT NULL"); //Forcing a record not to be null.
await session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.dateOfBirth IS NOT NULL"); //Forcing a record not to be null.
await session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.profilePictureUrl IS NOT NULL"); //Forcing a record not to be null.
await session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.contactEmail IS NOT NULL"); //Forcing a record not to be null.

// Add users to database

for (let i = 0; i < users.length; i++) {
	const user = users[i];
	console.log(`Adding user ${user.username} to database.`);
	console.log(user);
	await session.run(
		`
			CREATE (u:User {
				id: $id,
				firstName: $firstName,
				lastName: $lastName,
				username: $username,
				dateOfBirth: $dateOfBirth,
				profilePictureUrl: $profilePictureUrl,
				contactEmail: $contactEmail
			})
		`,
		{
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			dateOfBirth: Neo4jDate.fromStandardDate(user.dateOfBirth),
			profilePictureUrl: user.profilePictureUrl,
			contactEmail: user.contactEmail,
		}
	);
}

await session.close();

await neo4jDriver.close();



// https://neo4j.com/docs/cypher-manual/current/constraints/





// Types of constraint
// The following constraint types are available:

// Unique node property constraints
// Unique property constraints ensure that property values are unique for all nodes with a specific label. For unique property constraints on multiple properties, the combination of the property values is unique. Unique constraints do not require all nodes to have a unique value for the properties listed — nodes without all properties are not subject to this rule.

// Node property existence constraints
// Node property existence constraints ensure that a property exists for all nodes with a specific label. Queries that try to create new nodes of the specified label, but without this property, will fail. The same is true for queries that try to remove the mandatory property.

// Relationship property existence constraints
// Property existence constraints ensure that a property exists for all relationships with a specific type. All queries that try to create relationships of the specified type, but without this property, will fail. The same is true for queries that try to remove the mandatory property.

// Node key constraints
// Node key constraints ensure that, for a given label and set of properties:

// All the properties exist on all the nodes with that label.

// The combination of the property values is unique.

// Queries attempting to do any of the following will fail:

// Create new nodes without all the properties or where the combination of property values is not unique.

// Remove one of the mandatory properties.

// Update the properties so that the combination of property values is no longer unique.

// Node key constraints, node property existence constraints and relationship property existence constraints are only available in Neo4j Enterprise Edition. Databases containing one of these constraint types cannot be opened using Neo4j Community Edition.