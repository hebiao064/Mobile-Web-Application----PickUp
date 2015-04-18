
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
	response.success("Hello world!");
});

Parse.Cloud.define("get_more", function(request, response)
{
	//gets list of players
	var query = new Parse.Query("Players");
	query.equalTo("GameID", request.params.GameID);
	query.select("PlayerID");

	//gets game info
	var game = new Parse.Query("Current_Games");
	game.equalTo("GameID", request.params.GameID);
	game.select("Notes");

	var total = Parse.Query.or(query, game);
	query.find({
		success: function(results)
		{
			response.success(results);
		}
		error: function()
		{
			response.error("lookup failed");
		}
	})
	
});

Parse.Cloud.define("get_games", function(request, response)
{
	var query = new Parse.Query("Current_Games");
	query.select("GameID", "Location_Name", "Sport", "Num_Of_Players", "Max_Num_Of_Players", "Start_Time", "End_Time");
	query.ascending("Start_Time");
	query.limit(2);//increase to usable size
	query.find({
		success: function(results) {
			response.success(results);
		},
		error: function() {
			response.error("Game lookup failed");
		}
	});
});

Parse.Cloud.define("join_game", function(request, response)
{
	//add name to list of players

	var Players = Parse.Object.extend("Players");
	var add_to_list = new Players();
	//gets data from phone request
	add_to_list.set("PlayerID", request.params.PlayerID);
	add_to_list.set("GameID", request.params.GameID);
	//Save data to Players table
	add_to_list.save(null,
	{
		success: function(add_to_list)
		{
			response.success("Player added");
		},
		error: function(add_to_list, error)
		{
			response.error("Player add failed");
		}
	});
	

	//increment number in current_games table
	var Current_Games = Parse.Object.extend("Current_Games");
	var add_to_num = new Parse.Query(Current_Games);
	add_to_num.equalTo("GameID", request.params.GameID);

	add_to_num.find({
		success: function(results) {
			var game = results[0];
			var current_player_number = game.get('Num_Of_Players');
			game.set("Num_Of_Players", current_player_number + 1);
			game.save(null,
			{
				success: function(game)
				{
					response.success("Current_Games updated");
				},
				error:function(game, error)
				{
					response.error("Current_Games update failed");
				}
			});
		},
		error: function() 
		{
			response.error("Game not found");
		}
	});

});

Parse.Cloud.define("leave_game", function(request, response)
{
	var Players = Parse.Object.extend("Players");
	var add_to_list = new Parse.Query(Players);
	//gets data from phone request
	add_to_list.equalTo("PlayerID", request.params.PlayerID);
	add_to_list.equalTo("GameID", request.params.GameID);
	//Save data to Players table
	add_to_list.find(
	{
		success: function(results)
		{
			var person = results[0];
			person.destroy(
			{
				success: function(person)
				{
					response.success("Player dropped");
				}
				/*
				Including this error check was giving an error for some reason. Look into later. - SW
				error: function(person, error)
				{
					response.error("Player drop failed");
				}
				*/
			})
		},
		error: function()
		{
			response.error("Player drop failed");
		}
	});
	

	//decrement number in current_games table
	var Current_Games = Parse.Object.extend("Current_Games");
	var add_to_num = new Parse.Query(Current_Games);
	add_to_num.equalTo("GameID", request.params.GameID);

	add_to_num.find({
		success: function(results) {
			var game = results[0];
			var current_player_number = game.get('Num_Of_Players');
			game.set("Num_Of_Players", current_player_number - 1);
			game.save(null,
			{
				success: function(game)
				{
					response.success("Current_Games updated");
				},
				error:function(game, error)
				{
					response.error("Current_Games update failed");
				}
			});
		},
		error: function() 
		{
			response.error("Game not found");
		}
	});

});



Parse.Cloud.define("create_game", function(request, response)
{
	var Current_Games = Parse.Object.extend("Current_Games");
	var add_to_list = new Current_Games();
	//gets data from phone request
	add_to_list.set("GameID", request.params.GameID);
	add_to_list.set("Location_Name", request.params.Location_Name);
	add_to_list.set("Sport", request.params.Sport);
	add_to_list.set("Max_Num_Of_Players", request.params.Max_Num_Of_Players);
	add_to_list.set("Start_Time", request.params.Start_Time);
	add_to_list.set("End_Time", request.params.End_Time);
	add_to_list.set("Notes", request.params.Notes);
	add_to_list.set("Creator", request.params.PlayerID);
	add_to_list.set("Num_Of_Players", 1);
	//Save data to Players table
	add_to_list.save(null,
	{
		success: function(add_to_list)
		{
			response.success("Player added");
		},
		error: function(add_to_list, error)
		{
			response.error("Player add failed");
		}
	});

	//Double check that this currently adds the creator to the players list for this game
});


Parse.Cloud.define("get_location", function(request, response)
{
	var query = new Parse.Query("Location");
	query.select("Location_Name");
	query.find({
		success: function(results) {
			response.success(results);
		},
		error: function() {
			response.error("Location lookup failed");
		}
	});
});

Parse.Cloud.define("get_sports", function(request, response)
{
	var query = new Parse.Query("Sports");
	query.equalTo("Location_Name", request.params.Location_Name);
	query.find({
		success: function(results) {
			response.success(results);
		},
		error: function() {
			response.error("Sports lookup failed");
		}
	});
});

Parse.Cloud.define("cancel_game", function(request, response)
{
	//drops game from create_game talbe
	var query = new Parse.Query("Current_Games");
	query.equalTo("GameID", request.params.GameID);
	query.equalTo("Creator", request.params.PlayerID);
	query.find({
		success: function(results) {
			var game = results[0];
			game.destroy(
			{
				success: function(game)
				{
					response.success("Game dropped");
				}
				/*
				Including this error check was giving an error for some reason. Look into later. - SW
				error: function(person, error)
				{
					response.error("Game drop failed");
				}
				*/
			})

		},
		error: function() {
			response.error("Game cancel failed");
		}
	});
	//drop players from Players table
	var players = new Parse.Query("Players");
	players.equalTo("GameID", request.params.GameID);
	players.find({
		success: function(results){
			var player;
			for(i = 0; i < results.length; i++)
			{
				player = results[i];
				player.destroy(
				{

				})
			}
		},
		error: function()
		{
			response.error("Player drop failed");
		}
	});
});