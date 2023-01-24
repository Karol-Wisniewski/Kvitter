import config from "../config/config.js";
import neo4j from "neo4j-driver";

const driver = neo4j.driver(
	config.neo4j.url,
	neo4j.auth.basic(config.neo4j.username, config.neo4j.password),
	{disableLosslessIntegers: true}
);

export default driver;
