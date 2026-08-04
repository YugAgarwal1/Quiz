export default function DifficultyBadge({ difficulty }) {
    let badge;
    
    if(difficulty.toLowerCase() === "easy"){
        badge = <span className="text-xs md:text-sm px-3 py-1 rounded-full font-semibold bg-green-100 text-green-600">Easy</span>;
    }
    else if(difficulty.toLowerCase() === "medium") {
        badge = <span className="text-xs md:text-sm px-3 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-600">Medium</span>;
    }
    else if(difficulty.toLowerCase() === "hard") {
        badge = <span className="text-xs md:text-sm px-3 py-1 rounded-full font-semibold bg-red-100 text-red-600">Hard</span>;
    }
    
    return badge;
}       