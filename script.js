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
        getNews(inputField.value);
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
    getData();
    // converting lat and lon into CITY name
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`).then(res => res.json()).then(data =>{
        getNews(data.city);
    });
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
      
      for (let i = 0; i < 8; i++) {
        console.log(data.daily[i].temp.max);
      
        // display day name and icon
        let date = new Date(data.daily[i].dt * 1000);
        let day = date.getDay();
        let dayName = "";
        switch (day) {
            case 0:
                dayName = "Sun";
                break;
            case 1:
                dayName = "Mon";
                break;
            case 2:
                dayName = "Tue";
                break;
            case 3:
                dayName = "Wed";
                break;
            case 4:
                dayName = "Thu";
                break;
            case 5:
                dayName = "Fri";
                break;
            case 6:
                dayName = "Sat";
                break;
        }
        wrapperForcast.querySelector(`.card${i} .day`).innerText = dayName;
        wrapperForcast.querySelector(`.card${i} .icon`).src = `https://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}.png`;
        wrapperForcast.querySelector(`.card${i} .max`).innerText = `${Math.floor(data.daily[i].temp.max)}°`;
        wrapperForcast.querySelector(`.card${i} .min`).innerText = `${Math.floor(data.daily[i].temp.min)}°`;
      }
        
    } catch (error) {
      console.log(error);
    }
  };

//   news function using ajax

function getNews(city) {
    
//News Section
// Initialize the news api parameters
let source = 'the-times-of-india';
let apiKey = '8cc7fbd58d3144c68d6b2a6965645f48'

// Grab the news container
let newsAccordion = document.getElementById('newsAccordion');

console.log(city);
// Create an ajax get request
const xhr = new XMLHttpRequest();
xhr.open('GET', `https://newsapi.org/v2/everything?q=${city}&from=2022-11-06&sortBy=popularity&apiKey=${apiKey}`, true);

// What to do when response is ready
xhr.onload = function () {
    if (this.status === 200) {
        let json = JSON.parse(this.responseText);
        let articles = json.articles;
        let images = json.articles[0].content;
        console.log(articles);
        console.log(images);
        let newsHtml = "";
        articles.forEach(function(element, index) {
            // console.log(element, index)
            if(index > 4){
                return;
            }
                
            let news = `<div class="card p-2 m-2 ">
                            <div class="card-header" id="heading${index}">
                            <a href="${element['url']}" target="_blank" >
                                <h2 class="mb-2">
                                <button class="btn btn-link collapsed"  type="button" data-toggle="collapse" data-target="#collapse${index}"
                                    aria-expanded="false" aria-controls="collapse${index}">
                                    <img src="${element["urlToImage"]}" alt="..." class="img-fluid "><p class="text-justify">
                                   <b>Breaking News ${index+1}:</b>  ${element["title"]} </p>
                                </button>
                                </h2>
                            </div>

                            <div id="collapse${index}" class="" aria-labelledby="heading${index}" data-parent="#newsAccordion">
                                </a> 
                            </div>
                        </div>`
            newsHtml += news;
        });
        newsAccordion.innerHTML = newsHtml;
    }
    else {
        console.log("Some error occured")
    }
}

xhr.send()

}
    


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
        wrapperNews.querySelector(`.heading`).innerText = `${city} News`;
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


