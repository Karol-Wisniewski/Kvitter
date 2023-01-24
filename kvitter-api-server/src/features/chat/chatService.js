import neo4jDriver from '../../utils/neo4jDriver.js';
import mqtt from "mqtt"


class ChatService {

	constructor(neo4jDriver, mqttClient) {
		this.neo4jDriver = neo4jDriver;
        this.mqttClient = mqttClient
        mqttClient.on('connect', function () {
            // logi
           mqttClient.subscribe("chat/+/+");
           mqttClient.on("message", (topic, message) => {
            console.log(topic, JSON.parse(message.toString()))
            })
          })
	}

    async getMessages(senderId, receiverId) {
        const session = this.neo4jDriver.session();
		const result = await session.run('MATCH (u:User {id: $senderId})-[r:MESSAGED]-(u1:User {id: $receiverId}) RETURN r', {senderId, receiverId});
		const messages = result.records?.map((record) => {
			return record.get('r')?.properties
		});
		session.close();
		return messages;
    }

    async sendMessage({senderId, receiverId, content, date}) {
        const session = this.neo4jDriver.session();
		const result = await session.run(
            `
                MATCH (u:User {id: $senderId}), (u1:User {id: $receiverId})
                CREATE (u)-[r:MESSAGED {senderId: $senderId, receiverId: $receiverId, content: $content, date: $date}]->(u1)
                RETURN r
            `, 
            {
                senderId,
                receiverId,
                content,
                date
            }
        );
		session.close();
        this.mqttClient.publish(`chat/${senderId}/${receiverId}`, JSON.stringify(result.records[0].get("r").properties));
    }
}

const mqttClient  = mqtt.connect('mqtt://localhost:1883')

const chatService = new ChatService(neo4jDriver, mqttClient);

export default chatService;