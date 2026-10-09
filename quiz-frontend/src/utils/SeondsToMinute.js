export function SecondsToString(rawSeconds) {
    const totalSeconds = Math.max(0, parseInt(rawSeconds, 10) || 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const timeParts = [];
    if (hours > 0) timeParts.push(`${hours}h`);
    if (minutes > 0) timeParts.push(`${minutes}m`);
    if (seconds > 0 || timeParts.length === 0) {
        timeParts.push(`${seconds}s`);
    }
    return timeParts.join(' ');
}