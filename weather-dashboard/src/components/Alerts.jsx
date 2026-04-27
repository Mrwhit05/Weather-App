function Alerts({ weather, hourlyData }) {
    if (!weather) return null;
    
    let isSunny = false;
    let isFoggy = false;
    let isWindy = false;

    const isRainExpected = hourlyData?.some(
        hour => hour.pop > 0.5
    );

    const isHeavyRain = hourlyData?.some(
        hour => hour.rain?.["3h"] > 5
    );

    if (weather.clouds < 20) {
        isSunny = true;
    }

    if (weather.visibility < 7000) {
        isFoggy = true;
    }

    if (weather.wind.speed > 30) {
        isWindy = true;
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
    </div>
  );
}

export default Alerts;