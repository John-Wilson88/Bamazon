var mysql = require('mysql');
var inquire = require('inquirer');

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'Bamazon',
	socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});

function endConnection(){
	connection.end(function(err){

	});
}

function buySomething() {

	function showProducts() {
		connection.query("SELECT * FROM products", function(err, data){
			if (err) throw err;

			console.log("\n-------------All Products for Sale------------\n");
			for(var i = 0; i < data.length; i++){
				console.log("ID Number: " + data[i].item_id + " | " + "Product Name: " + data[i].product_name + " | " + "Price: $" + data[i].price);
			}
			console.log("--------------------------------------------------\n");
			selectProduct();
		});
	}

	function selectProduct() {
		inquire.prompt([

			{
				type: "input",
				message: "Input the ID Number of the product you would like to order.",
				name: "productID"	
			},
			{
				type: "input",
				message: "Okay, how many would you like?",
				name: "productAmount"
			}

			]).then(function(response){

				var prodID = parseInt(response.productID);
				var prodAmount = parseInt(response.productAmount);

				if (isNaN(prodID)){
					console.log("\n----------------------------------------------");
					console.log("------------ INVALID ID OR AMOUNT ------------");
					console.log("--------- INTEGERS MUST BE ENTERED -----------");
					console.log("----------------------------------------------\n");
					buySomething();
				} 
				else if (isNaN(prodAmount)){
					console.log("\n----------------------------------------------");
					console.log("------------ INVALID ID OR AMOUNT ------------");
					console.log("--------- INTEGERS MUST BE ENTERED -----------");
					console.log("----------------------------------------------\n");
					buySomething();
				}
				else {
					checkAvailibility(prodID, prodAmount);
				}
				
		});
	}

	function checkAvailibility(id, amount) {

			// try using count, for number of items, to test against invalid IDs.
			connection.query("SELECT COUNT(*) FROM products", function(err, num){

				var count = num[0];
				var itemCount = count[Object.keys(count)[0]];


			connection.query("SELECT * FROM products WHERE item_id = ?", id, function(err, data) {

				if(err) throw err;

				if(id > itemCount){
					console.log("\n----------------------------------------------");
					console.log("------------ INVALID ID SELECTED -------------");
					console.log("----------------------------------------------\n");
					buySomething();
				} else {
					var newStock = data[0].stock_quanity - amount;

					if(newStock < 0){
						console.log("\n----------------------------------------------");
						console.log("Invailid Amount \nNot enought items instock...");
						console.log("----------------------------------------------\n");
						buySomething();
					}

					if(newStock >= 0) {
						console.log("\n-------------------------------------------------");
						console.log("---------- you order is being processed ----------");
						console.log("--------------------------------------------------\n");
						placeOrder(id, newStock);
					}
				}
		});

		});
	}

	function placeOrder(id, amount) {
		
		connection.query("UPDATE products SET stock_quanity = ? WHERE item_id = ?", [amount, id], function(err, result) {
			if (err) throw err;

			if (result.affectedRows) {
				console.log("\n--------------------------------------------------");
				console.log("------------- Your order has been placed -----------");
				console.log("--------------------------------------------------\n \n \n ");

				inquire.prompt([

						{
							type: "list",
							message: "Would you like to make another order?",
							choices: ["YES", "NO"],
							name: "continue"
						}

					]).then(function(res){

						if(res.continue == "YES"){
							buySomething();
						}
						else {
							endConnection();
						}
					});

				
			}
		});
	}


showProducts();

}

buySomething();
