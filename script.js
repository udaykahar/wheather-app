const wrapper = document.querySelector(".wrapper"),
inputPart = document.querySelector(".input-part"),
infoTxt = inputPart.querySelector(".info-txt"),
inputField = inputPart.querySelector("input"),
locationBtn = inputPart.querySelector("button"),
weatherPart = wrapper.querySelector(".weather-part"),
wIcon = weatherPart.querySelector("img"),
arrowBack = wrapper.querySelector("header i"),
wrapperForcast = document.querySelector(".wrapper-forecast"),
wrapperNews = document.querySelector(".wrapper-news");

const your_api_key = "3045dd712ffe6e702e3245525ac7fa38";

inputField.addEventListener("keyup", e =>{
    // if user pressed enter btn and input value is not empty
    if(e.key == "Enter" && inputField.value != ""){
        requestApi(inputField.value);
    }
});

locationBtn.addEventListener("click", () =>{
    if(navigator.geolocation){ // if browser support geolocation api
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }else{
        alert("Your browser not support geolocation api");
    }
});


function requestApi(city){
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${your_api_key}`;
    fetchData();
    getData();
}

function onSuccess(position){
    const {latitude, longitude} = position.coords; // getting lat and lon of the user device from coords obj
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${your_api_key}`;
    fetchData();
}

function onError(error){
    // if any error occur while getting user location then we'll show it in infoText
    infoTxt.innerText = error.message;
    infoTxt.classList.add("error");
}

function fetchData(){
    infoTxt.innerText = "Getting weather details...";
    infoTxt.classList.add("pending");

    fetch(api).then(res => res.json()).then(result => weatherDetails(result)).catch(() =>{
        infoTxt.innerText = "Something went wrong";
        infoTxt.classList.replace("pending", "error");
    });
}

const getData = async () => {
    console.log("HELLO");
    try {
        const response = await fetch(api);
        const data = await response.json();
        let latitude = data.coord.lat;
        let longitude = data.coord.lon;
        getDatafor7days(latitude, longitude);
    } catch (error) {
        console.log(error);
    }
  };

const getDatafor7days = async (latitude, longitude) => {
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${your_api_key}`;
    try {
      let res = await fetch(url);
      let data = await res.json();
      console.log("data", data);
        
      for (let i = 0; i < 8; i++) {
        console.log(data.daily[i].temp.max);
        wrapperForcast.querySelector(`.card${i} .max`).innerText = Math.floor(data.daily[i].temp.max);
      }
        let dailyMaxTemp = data.daily[0].temp.max;
        let dailyMinTemp = data.daily[0].temp.min;

       

        // passsing weather info to forecast section
        
        wrapperNews.querySelector(`.heading`).innerText = `${city}, ${country}+ News`;
    } catch (error) {
      console.log(error);
    }
  };

function weatherDetails(info){
    if(info.cod == "404"){ // if user entered city name isn't valid
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    }else{
        //getting required properties value from the whole weather information
        const city = info.name;
        const country = info.sys.country;
        const {description, id} = info.weather[0];
        const {temp, feels_like, humidity} = info.main;

        // show weather-news section and hide on back arrow click
        wrapperForcast.classList.add("visible");
        wrapperNews.classList.add("visible");

        // using custom weather icon according to the id which api gives to us
        if(id == 800){
            wIcon.src = "icons/clear.svg";
        }else if(id >= 200 && id <= 232){
            wIcon.src = "icons/storm.svg";  
        }else if(id >= 600 && id <= 622){
            wIcon.src = "icons/snow.svg";
        }else if(id >= 701 && id <= 781){
            wIcon.src = "icons/haze.svg";
        }else if(id >= 801 && id <= 804){
            wIcon.src = "icons/cloud.svg";
        }else if((id >= 500 && id <= 531) || (id >= 300 && id <= 321)){
            wIcon.src = "icons/rain.svg";
        }
        
        //passing a particular weather info to a particular element
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
        weatherPart.querySelector(".weather").innerText = description;
        weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
        weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        inputField.value = "";
        wrapper.classList.add("active");

     

    }
}

arrowBack.addEventListener("click", ()=>{
    wrapper.classList.remove("active");
    wrapperForcast.classList.remove("visible");
    wrapperNews.classList.remove("visible");

});


