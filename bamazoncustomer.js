// Then create a Node application called bamazonCustomer.js. Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.

// The app should then prompt users with two messages.

// The first should ask them the ID of the product they would like to buy.
// The second message should ask how many units of the product they would like to buy.
// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.

// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
// However, if your store does have enough of the product, you should fulfill the customer's order.

// This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.

// initialize require packages
var inquirer = require('inquirer');
var mysql = require('mysql');

// add mysql connection parameters
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'D0nD@dda',
  database : 'bamazon'
});
connection.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log("connected as id " + connection.threadId);
    //function that calls inquirer
});

// display all of the items available for sale. Include the ids, names, and prices of products for sale
//connection query and display to console
var startSale = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) {
            throw err;
        }
        console.log("These are the Available products:");
        console.log("Item ID | Product Name | Department Name | Price | Stock Quantity");
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + "|" + res[i].product_name + "|" + res[i].department_name + "|" + res[i].price + "|" + res[i].stock_quantity);
        }

        completeSale();
    });
};

var anotherSale = function () {
    inquirer.prompt({
        name: "anotherSale",
        message: "Would you like to buy something else?",
        type: "confirm"
    }).then(function (answers) {
        if (answers.anotherSale) {
            startSale();
        } else {
        	console.log("Thank you for shopping at Bamazon, Hope to see you again soon!");
            connection.end();
            return false;
        }
    })
       
}


//prompt users with two messages.
// #1. What is the ID of the product you would like to buy.
// #2. ask how many units of the product they would like to buy.
//confirm order placement

var salePrompts = [
    {
        name: "productID",
        message: "What is the ID of the product you would like to buy?",
    }, {
        name: "units",
        message: "How many do you need?"
    }, {
        name: "confirmSale",
        message: "Place your order?",
        type: "confirm"
    }
];



var completeSale = function () {


    inquirer.prompt(salePrompts)
        .then(function (answers) {
            if (answers.confirmSale === true) {
                
                //check how many of each items bamazon has available.
                var query = "SELECT * FROM products WHERE item_id=?";
                connection.query(query, answers.productID, function (err, res) {
                    if (err) throw err;
                    var productToBuy = res[0];

                    if (productToBuy.stock_quantity >= answers.units) {
                        // However, if your store does have enough of the product, you should fulfill the customer's order.
                        // This means updating the SQL database to reflect the remaining quantity.
                        var newQuantity = productToBuy.stock_quantity - answers.units;
                        var query2 = "UPDATE products SET ? WHERE ?";

                        connection.query(query2, [{ stock_quantity: newQuantity }, { item_id: productToBuy.item_id }], function (err, res) {
                            if (err) {
                                throw err;
                            }
                            // Once the update goes through, show the customer the total cost of their purchase.
                            var totalCost = Math.round(productToBuy.price * answers.units * 100) / 100;
                            console.log("Your total cost is: " + totalCost);
                            // connection.end();
                            anotherSale();
                        });

                    } else {
                        // If not enough items available log Insufficient quantity!, and stop the order from going through.
                        console.log("Insufficient quantity!");
                        anotherSale();
                    }

                })
            }
            else {
                console.log("Thanks for shopping with Bamazon! Come again soon!");
                anotherSale();
            }
        });
};


startSale();
