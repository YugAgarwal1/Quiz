export function SecondsToString(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const timeParts = [];

    if (hours > 0) timeParts.push(`${hours}h`);
    
    if (minutes > 0) timeParts.push(`${minutes}m`);
    
    if (seconds > 0 || timeParts.length === 0) {
        timeParts.push(`${seconds}`);
    }
    return timeParts.join(':');
}