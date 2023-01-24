import dotenv from 'dotenv';
dotenv.config();

const config = {
	apiServer: {
		port: process.env.API_SERVER_PORT || 3000,
	},
	neo4j: {
		url: process.env.NEO4J_URL || "neo4j+s://daedb040.databases.neo4j.io",
		username: process.env.NEO4J_USERNAME || 'neo4j',
		password: process.env.NEO4J_PASSWORD || 'Konkola311',
	},
};

export default config;
