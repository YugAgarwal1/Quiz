const Helpers = (function () {

    function renderElapsedString(elapsed, runningSince) {
        let totalElapsed = elapsed;
        if(runningSince) {
            totalElapsed += Date.now() - runningSince;
        }
        return millisecondsToHuman(totalElapsed);
    }

    function millisecondsToHuman(ms) {
        const seconds = Math.floor((ms/1000) % 60);
        const minutes = Math.floor((ms/1000/60) % 60);
        const hours = Math.floor((ms/1000/60/60));

        const humanized = [
            pad(hours.toString()),
            pad(minutes.toString()),
            pad(seconds.toString())
        ].join(':');

        return humanized;
    }

    function pad(numberString, size=2){
        let padded = numberString;
        while(padded.length < size) {
            padded = `0${padded}`;
        }
        return padded;
    }

    return {
        renderElapsedString,
        millisecondsToHuman,
        pad
    };

}());

export default Helpers;
