const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeServerAndDb = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("SERVER STARTED");
  });
};
initializeServerAndDb();
//conversion of case
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    matchId: dbObject.match_id,
  };
};

//GET ALL PLAYERS LIST API
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT * FROM player_details ORDER BY player_id;`;
  const playerList = await db.all(getAllPlayersQuery);
  response.send(
    playerList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//GET PARTICULAR PLAYER API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getParticularPlayer = `
    SELECT * FROM player_details WHERE player_id=${playerId};`;
  const playerDetail = await db.get(getParticularPlayer);
  response.send(convertDbObjectToResponseObject(playerDetail));
});

//UPDATE PARTICULAR PLAYER ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerDetails = `
    UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId}; `;
  await db.run(updatePlayerDetails);
  // console.log("OK");
  response.send("Player Details Updated");
});

//GET MATCH DETAILS OF SPECIFIC MATCH
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getParticularMatchDetails = `
    SELECT * FROM match_details WHERE match_id=${matchId};`;
  const matchDetail = await db.get(getParticularMatchDetails);
  response.send(convertDbObjectToResponseObject(matchDetail));
});

//GET MATCHES BY PLAYER ID  API
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT  match_details.match_id, match_details.match, match_details.year  FROM player_match_score INNER JOIN match_details ON player_match_score.match_id=match_details.match_id  WHERE player_id=${playerId};`;
  const matchPlayerDetails = await db.get(getPlayerMatchesQuery);
  response.send(convertDbObjectToResponseObject(matchPlayerDetails));
});

//GET PLAYER BY MATCH ID API
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayerQuery = `
    SELECT player_details.player_id,player_details.player_name FROM player_match_score INNER JOIN player_details ON player_match_score.player_id=player_details.player_id WHERE match_id=${matchId};`;
  const getPlayerMatchDetails = await db.get(getMatchPlayerQuery);
  response.send(convertDbObjectToResponseObject(getPlayerMatchDetails));
});

//GET STATS API
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatQuery = `
    SELECT player_details.player_id,player_details.player_name , sum(score) AS totalScore, sum(fours) AS totalFours , sum(sixes) AS totalSixes  FROM player_match_score INNER JOIN player_details ON player_match_score.player_id=player_details.player_id WHERE player_match_score.player_id=${playerId};`;
  const getStatDetails = await db.get(getStatQuery);
  response.send(convertDbObjectToResponseObject(getStatDetails));
});
module.exports = app;
