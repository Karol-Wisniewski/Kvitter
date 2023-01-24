import neo4jDriver from '../../utils/neo4jDriver.js';

class TweetsService {
	constructor(neo4jDriver) {
		this.neo4jDriver = neo4jDriver;
		this.sessions;
    }

    async getAll() {
		const session = this.neo4jDriver.session();
		const result = await session.run(
			`
				MATCH (t:Tweet)-[:CREATED_BY]->(tc:TweetCreator)
				RETURN t, tc
			`
		);
		const tweets = result.records.map((record) => {
			return {
				t: record.get('t').properties,
				tc: record.get('tc').properties
			}
		});
		session.close();
		return tweets;
	}

    async getTweetsByUserId(userId) {
		const session = this.neo4jDriver.session();

		const result = await session.run(
			`
                MATCH (t:Tweet)-[:CREATED_BY]->(tc:TweetCreator {userId: $userId})
                RETURN t
			`,
			{
				userId
			}
		);

		const userTweets = result.records.map((record) => {
			return record.get('t').properties;
		});

		session.close();
		return userTweets;
	}

	async getLikedTweets(userId) {
		const session = this.neo4jDriver.session();
		const result = await session.run(
			`
				OPTIONAL MATCH (t:Tweet)-[:CREATED_BY]->(tc:TweetCreator)
				WHERE $userId IN t.likedBy
				RETURN t, tc
			`,
			{
				userId: userId
			}
		);

		const tweets = result.records?.map((record) => {
			return {
				t: record.get('t')?.properties,
				tc: record.get('tc')?.properties
			}
		});

		session.close();
		return tweets;
	}

	async countTweetsByUserId(userId) {
		const session = this.neo4jDriver.session();

		const userTweetsCount = await session.run(
			`
				MATCH (t:Tweet)-[:CREATED_BY]->(tc:TweetCreator {userId: $userId}) 
				RETURN count(t) as count
			`,
			{
				userId
			}
		);

		session.close();
		return userTweetsCount;
	}

	async deleteTweetById(tweetId) {
		const session = this.neo4jDriver.session();

		const deleteTweet = await session.run(
			`
				MATCH (t:Tweet {id: $tweetId})-[:CREATED_BY]->(tc:TweetCreator)
				OPTIONAL MATCH (t)-[cr:COMMENTED]->(c:Comment)
				OPTIONAL MATCH (t)-[r:LIKED_BY]->(:User)
                DETACH DELETE t, tc, r, cr, c
			`,
			{
				tweetId
			}
		);

		session.close();
	}

    async addTweet(
		{
			id, 
			userId, 
			date, 
			content, 
			pictureUrl, 
			firstName, 
			lastName, 
			username,
			authorProfilePicture,
			audience
		}
	) {

        const neo4jSession = this.neo4jDriver.session();

        console.log(`Adding a tweet to database.`);

		const tweet = await neo4jSession.run(
			`
				CREATE (t:Tweet {
					id: $id,
                    date: $date,
                    content: $content,
                    pictureUrl: $pictureUrl,
					likedBy: $likedBy,
					audience: $audience
				})-[f:CREATED_BY]->(tc:TweetCreator {
					userId: $userId, 
					firstName: $firstName, 
					lastName: $lastName, 
					username: $username, 
					authorProfilePicture: $authorProfilePicture
				})
			`,
			{
				id: id,
				date: date,
                content: content,
                pictureUrl: pictureUrl,
				likedBy: [],
				userId,
				firstName,
				lastName,
				username,
				authorProfilePicture,
				audience
			}
		);

		neo4jSession.close();

    }

	async likeTweet({userId, tweetId}) {

		const session = this.neo4jDriver.session();

		const result = await session.run(
			`
				MATCH (u:User {id: $userId}), (t:Tweet {id: $tweetId})
				CREATE (t)-[r:LIKED_BY]->(u)
				SET t.likedBy = $userId + t.likedBy
			`,
			{
				userId,
				tweetId
			}
		);

		session.close();

	}

	async dislikeTweet({userId, tweetId}) {

		const session = this.neo4jDriver.session();

		const result = await session.run(
			`
				MATCH (u:User {id: $userId})<-[r:LIKED_BY]-(t:Tweet {id: $tweetId})
				DETACH DELETE r
				SET t.likedBy = [x IN t.likedBy WHERE x <> $userId]
			`,
			{
				userId,
				tweetId
			}
		);

		session.close();

	}

	async commentTweet(
		{
			commentId, 
			tweetId, 
			comment, 
			date, 
			idOfTweetAuthor,
			commenterId,
			commenterFirstName,
			commenterLastName,
			commenterProfilePicture
		}
	) {

		const session = this.neo4jDriver.session();

		const result = await session.run(
			`
				MATCH (t:Tweet {id: $tweetId})
				CREATE (t)-[r:COMMENTED]->(c:Comment {id: $commentId, tweetId: $tweetId, comment: $comment, date: $date, idOfTweetAuthor: $idOfTweetAuthor, commenterId: $commenterId, commenterFirstName: $commenterFirstName, commenterLastName: $commenterLastName, commenterProfilePicture: $commenterProfilePicture})
				RETURN r, c
			`,
			{
				commentId,
				tweetId,
				comment,
				date,
				idOfTweetAuthor,
				commenterId,
				commenterFirstName,
				commenterLastName,
				commenterProfilePicture
			}
		);

		session.close();

	}

	async getCommentsForUser(userId) {
		const session = this.neo4jDriver.session();

		const result = await session.run(
			`
				MATCH (t:Tweet)-[:COMMENTED]->(c:Comment {idOfTweetAuthor: $userId})
				RETURN c
			`,
			{
				userId
			}
		);

		const comments = result.records.map((record) => {
			return record.get('c').properties
		});

		session.close();

		return comments;
	}

	async getAllComments() {
		const session = this.neo4jDriver.session();

		const result = await session.run(
			`
				MATCH (c:Comment)
				RETURN c
			`
		);

		const allComments = result.records.map((record) => {
			return record.get('c').properties
		});

		session.close();

		return allComments;
	}
}

const tweetsService = new TweetsService(neo4jDriver);

export default tweetsService;