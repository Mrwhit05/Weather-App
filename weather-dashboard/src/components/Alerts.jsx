function Alerts({ weather, hourlyData }) {
    if (!weather) return null;
    
    let alertsGenerated = false;
    let isRainExpected = false;
    let isSunny = false;
    let isFoggy = false;
    let isWindy = false;

    //const isHeavyRain = hourlyData?.some(
    //    hour => hour.rain?.["3h"] > 5
    //);

    if (hourlyData.some(hour => hour.pop > 0.5)) {
      isRainExpected = true;
      alertsGenerated = true;
    }

    if (weather.clouds < 20) {
        isSunny = true;
        alertsGenerated = true;
    }

    if (weather.visibility < 2000) {
        isFoggy = true;
        alertsGenerated = true;
    }

    if (weather.wind.speed > 30) {
        isWindy = true;
        alertsGenerated = true;
    }

  return (
    <div className="alerts">
          <h2>Alerts</h2>
          {isWindy && <div className="alertCard wind">
            <p>Wind Advisory</p>
          </div>}
          {isRainExpected && <div className="alertCard rain">
            <p>Rain Expected</p>
          </div>}
          {isFoggy && <div className="alertCard fog">
            <p>Low Visibility Advisory</p>
          </div>}
          {isSunny && <div className="alertCard sun">
            <p>Sunny</p>
          </div>}
          {!alertsGenerated && <div className="noAlertCard">
            <p>No Alerts</p>  
          </div>}
    </div>
  );
}

export default Alerts;