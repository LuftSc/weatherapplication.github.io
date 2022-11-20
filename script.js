init();

function init() {
    setClickOnButton(".showInputWindow", clickOnCreateNewVidjet);
    setClickOnButton(".modal__show", clickOnShowWeatherCoordinate);
    setClickOnButton(".modal__close", clickOnCloseInputWindow);
    setClickOnButton(".modal__onCity", clickOnChangeCityName);
    setClickOnButton(".modal__coord", clickOnChangeCoordinate);
    setClickOnButton(".modal__show-city", clickOnShowWeatherCity)
}

function clickOnCreateNewVidjet() {
    const modalOverlay = document.querySelector(".modal-overlay");
    const modals = document.querySelector(".modals")
    modals.classList.remove('modal-overlay--visible');
    document.querySelector('[data-target="show"]').classList.add('modal--visible');
    modalOverlay.classList.add('modal-overlay--visible');
    setVisibleForElements({".vidjets":"hidden"});
    document.querySelector(".modal__city").style.display = "flex";
}

async function clickOnShowWeatherCoordinate() {
    const lat = document.querySelector(".modal__input-lat").value;
    const lon = document.querySelector(".modal__input-lon").value;
    const latIsValid = validationCheck(lat, -90, 90);
    const lonIsValid = validationCheck(lon, -180, 180);
    const modals = document.querySelector(".modals");
    const modalOverlay = document.querySelector(".modal-overlay");
    const testResult = latIsValid + lonIsValid;

    if(testResult === 2) {
        let weatherInfo = await getWeatherInfo(createURL(lat, lon))
        showWeatherInfo(weatherInfo);
        modals.classList.remove('modal-overlay--visible');
        modalOverlay.classList.remove('modal-overlay--visible');
        setVisibleForElements({".modal__warning-lat":'hidden',".modal__warning-lon":'hidden', ".vidjets":"visible"} )
    } else if (testResult === 1) {
        if (latIsValid) setVisibleForElements({".modal__warning-lat":'hidden', ".modal__warning-lon":'visible'});
        else setVisibleForElements({".modal__warning-lat":'visible', ".modal__warning-lon":'hidden'});
    } else setVisibleForElements({".modal__warning-lat":'visible', ".modal__warning-lon":'visible'})
}

function clickOnCloseInputWindow() {
    const modals = document.querySelector(".modals");
    const modalOverlay = document.querySelector(".modal-overlay");
    modals.classList.remove('modal-overlay--visible');
    modalOverlay.classList.remove('modal-overlay--visible');
    setVisibleForElements({".vidjets": "visible"});
    document.querySelector(".modal__city").style.display = "none";
}

function clickOnChangeCityName() {
    setVisibleForElements({
        ".modal__text-lat": "hidden",
        ".modal__input-lat": "hidden",
        ".modal__text-lon": "hidden",
        ".modal__input-lon": "hidden",
        ".modal__onCity": "hidden",
        ".modal__show": "hidden",
        ".modal__city": "visible",
        ".modal__warning-lat": "hidden",
        ".modal__warning-lon": "hidden",
        ".modal__warning-city": "hidden",
        ".modal__warning-city-letter": "hidden",
    });
}

function clickOnChangeCoordinate() {
    setVisibleForElements({
        ".modal__city": "hidden",
        ".modal__show": "visible",
        ".modal__text-lat": "visible",
        ".modal__input-lat": "visible",
        ".modal__text-lon": "visible",
        ".modal__input-lon": "visible",
        ".modal__onCity": "visible",
        ".modal__warning-city": "hidden",
        ".modal__warning-city-letter": "hidden"
    })
}

async function clickOnShowWeatherCity() {
    const cityName = document.querySelector(".modal__input-city").value;
    const modals = document.querySelector(".modals");
    const modalOverlay = document.querySelector(".modal-overlay");
    const onlyLetters = /^[a-zA-Zа-яА-Я]*$/.test(cityName);
    setVisibleForElements({".modal__warning-city":"hidden", ".modal__warning-city-letter": "hidden"})
    if (onlyLetters && cityName.length > 0) {
        let weatherInfo = await getWeatherInfo(createURL(cityName));
        if (checkWeatherInfo(weatherInfo)) {
            setVisibleForElements({".modal__warning-city": "visible"})
        } else {
            showWeatherInfo(weatherInfo);
            modals.classList.remove('modal-overlay--visible');
            modalOverlay.classList.remove('modal-overlay--visible');
            setVisibleForElements({".vidjets":"visible", ".modal__warning-city": "hidden", ".modal__warning-city-letter": "hidden"} )
            document.querySelector(".modal__city").style.display = "none";
        }
    } else {
        setVisibleForElements({".modal__warning-city-letter": "visible"});
    }
}

function getWeatherInfo(url) {
    return fetch(url)
        .then(function (resp) {return resp.json()})
        .then(function (data) { console.log(data);return data; })
        .catch(function (err) {

        })
}

function setClickOnButton(selector, click_function) {
    const button = document.querySelector(selector);
    button.addEventListener('click', click_function);
}

function createURL() {
    const apiKey = '&appid=ced658d0d5b7cef9512b60870e6680ad'
    const reference = 'http://api.openweathermap.org/data/2.5/weather?'
    let parametrs = ''
    if (arguments.length == 1 && isNaN(arguments[0])) {
        parametrs = `q=${arguments[0]}&`;
    }
    else if (arguments.length == 2 && !isNaN(arguments[0])) {
        parametrs = `lat=${arguments[0]}&lon=${arguments[1]}&`
    } else {
        parametrs = `id=${arguments[0]}&`
    }
    return `${reference}${parametrs}${apiKey}`
}

function getCorrectWeatherInfo(weatherInfo) {
    let result = {};
    result.name = weatherInfo.name.length > 0 ? weatherInfo.name : "(Нет населённого пункта)"
    result.temp = Math.round(weatherInfo.main.temp - 273.15);
    result.feels_like = Math.round(weatherInfo.main.feels_like - 273.15);
    if (weatherInfo.clouds.all <= 33) result.clouds = "Слабая облачность";
    else if (weatherInfo.clouds.all <= 66) result.clouds = "Средняя облачность";
    else result.clouds = "Высокая облачность"
    result.humidity = weatherInfo.main.humidity;
    result.visibility = weatherInfo.visibility;
    result.wind = weatherInfo.wind.speed;
    return result;
}

function yandexMapInit(lat, lon) {
    ymaps.ready(init);
    function init() {
        let map = new ymaps.Map('map', {
            center: [lat, lon],
            zoom: 7
        });
        map.geoObjects.add(new ymaps.Placemark([lat, lon], {
            preset: 'islands#icon',
            iconColor: '#0095b6'
        }))
    }
}

function showWeatherInfo(weatherInfo) {
    const WI = getCorrectWeatherInfo(weatherInfo);
    const vidjets = document.querySelector(".vidjets")
    vidjets.insertAdjacentHTML("afterbegin", `
    <div class="vidjet">
        <div class="vidjet__wrapper">
            <h4 class="vidjet__city-name"><b>${WI.name}</b></h4>
            <h3 class="vidjet__degrees"><b>${WI.temp}<sup>o</sup></b></h3>
            <h5 class="vidjet__realy-degrees">Ощущается как <b>${WI.feels_like}<sup>o</sup></b></h5>
            <h5 class="vidjet__cloudly">Облачность: <b>${WI.clouds}</b></h5>
            <h5 class="vidjet__water-visible">Влажность: <b>${WI.humidity}%</b>, Видимость: <b>${WI.visibility}м</b></h5>
            <h5 class="vidjet__speed-wind">Скорость ветра: <b>${WI.wind} м/с</b></h5>    
        </div>
        <div id="map" class="vidjet__map"> </div>
    </div>
    <div class="vidjet__horizontal-line"><hr/></div>`);
    yandexMapInit(weatherInfo.coord.lat, weatherInfo.coord.lon);
}

function setVisibleForElements(communications) {
    for(let el in communications)
        document.querySelector(el).style.visibility = communications[el];
}

function validationCheck(value, min, max) {
    const NaN_check =  !isNaN(value);
    const f_value = parseFloat(value);
    const range_check = f_value <= max && f_value >= min;
    return NaN_check && range_check;
}

function checkWeatherInfo(weatherInfo) {
    return parseInt(weatherInfo.cod) >= 400;
}