
// main JavaScript file for the web platform

function requestSuccessful(){
  $("#loading").hide();
}

function alreadyRunning(){
  alert("Something is already running! Please wait.");
}

function getPriceHistory(){
    
    if ($("#loading").is(":hidden")) {
      
      //Show the loading icon
      $("#loading").addClass("loadingSpinner").show();
      
      //Execute the function to update prices in the database
      $.ajax({
        url:"/price_history",
        type:"GET",
        contentType:"application/json",
        success: requestSuccessful
      });
      
    } else {
      alreadyRunning();
    }
    
}

function pricePrediction(coin){
    
    if ($("#loading").is(":hidden")) {
      
      //Show the loading icon
      $("#loading").show();
      
      //Empty the price prediction box
      $("#pricePredictionBox").hide();
      
      //Execute the function to update prices in the database
      $.ajax({
        url: "/price_prediction",
        type: "POST",
        data: JSON.stringify({COIN: coin.value}),
        dataType: "json",
        contentType:"application/json",
        success: function(data){
          parsed_data = JSON.parse(data);
          
          // Parse the prediction timestamps and present in locale
          var predict_time = JSON.parse(JSON.stringify(parsed_data.predict_time));
          predict_time = predict_time.split(" ");
          var predict_time_dt = predict_time[0].split("-");
          const predict_year = parseInt(predict_time_dt[0]);
          const predict_month = parseInt(predict_time_dt[1])-1;
          const predict_day = parseInt(predict_time_dt[2]);
          predict_time = predict_time[1].split(":");
          const predict_hours = parseInt(predict_time[0]);
          const predict_min = parseInt(predict_time[1]);
          const predict_sec = parseInt(predict_time[2]);
          predict_time = new Date(Date.UTC(predict_year,predict_month,predict_day,predict_hours,predict_min,predict_sec)).toLocaleString();
          
          // Display the price prediction details
          $("#predict_coin").html(coin.value);
          $("#predict_time").html("Latest Candle Time = " + predict_time);
          $("#predict_close").html("Latest Close Price = " + JSON.parse(JSON.stringify(parsed_data.predict_close)));
          $("#predict_prediction").html("Price Prediction = " + JSON.parse(JSON.stringify(parsed_data.prediction)));
          $("#predict_change").html("Expected 24-Hour Price Change = " + JSON.parse(JSON.stringify(parsed_data.expected_change)));
          
          // Parse the training timestamp and present in locale
          var training_time = JSON.parse(JSON.stringify(parsed_data.stats_training_time));
          training_time = training_time.split(" ");
          var training_date = training_time[0].split("-");
          const year = parseInt(training_date[0]);
          const month = parseInt(training_date[1])-1;
          const day = parseInt(training_date[2]);
          training_time = training_time[1].split(":");
          const hours = parseInt(training_time[0]);
          const min = parseInt(training_time[1]);
          const sec = parseInt(training_time[2]);
          training_date = new Date(Date.UTC(year,month,day,hours,min,sec)).toLocaleString();
          
          $("#stats_training_time").html("Model Training Time = " + training_date);
          $("#stats_mae").html("Model MAE = " + JSON.parse(JSON.stringify(parsed_data.stats_mae)));
          $("#stats_mape").html("Model MAPE = " + JSON.parse(JSON.stringify(parsed_data.stats_mape)));
          
          $("#pricePredictionBox").show();
          requestSuccessful();
          
        }
      });
      
    } else {
      
      alreadyRunning();
      
    }
    
    
    
}