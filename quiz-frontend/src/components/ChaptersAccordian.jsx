import { useState } from "react";
import "../styles/custom.css";
export default function ChaptersAccordian({data = [], selectedChapter, setSelectedChapter}) {
    // State to track active chapter index
    const [activeDescription, setActiveDescription] = useState(0);
    // Function to toggle chapter accordion
    const selectChapter = (index) => {
        if(activeDescription === index) {
            setActiveDescription(-1);
        } else {
            setActiveDescription(index);
        }
    };
    // Function to add chapter selected for the practise
    const addChapter = (chapterNumber) => {
        if(selectedChapter.includes(chapterNumber)) {
            setSelectedChapter(selectedChapter.filter(item => item !== chapterNumber));
        } else {
            setSelectedChapter([...selectedChapter, chapterNumber]);
        }
        console.log(selectedChapter);    // prints previo states but is correct when in useEffect Dont worry 
    };
    return (
        <>
            <div id="accordion-card" data-accordion="collapse">
               {data?.map((item, index) => (
                   <div key={index} className="mb-2">
                       <h2 id={`accordion-card-heading-${index}`}>
                           <button type="button" className={`text-[14px] lg:text-[16px] flex items-center justify-between w-full p-5 font-medium rtl:text-right 
                           ${selectedChapter.includes(item.ChapterNumber) ? 'text-[var(--primary-red)]' : 'text-body'} rounded-base shadow-xs border ${selectedChapter.includes(item.ChapterNumber) ? 'border-[var(--primary-red)]' : 'border-default'} hover:text-[var(--primary-red)]
                           hover:border-[var(--primary-red)] cursor-pointer hover:bg-neutral-secondary-medium gap-3 [&[aria-expanded='true']]:rounded-b-none [&[aria-expanded='true']]:shadow-none`} data-accordion-target={`#accordion-card-body-${index}`} aria-expanded="true" aria-controls={`accordion-card-body-${index}`}
                           onClick={() => addChapter(item.ChapterNumber)}
                           >
                               <span>{item.ChapterName}</span>
                               <svg data-accordion-icon className="w-5 h-5 rotate-180 shrink-0 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" onClick={() => selectChapter(index)}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7" /></svg>
                           </button>
                       </h2>
                       <div id={`accordion-card-body-${index}`} className={`${activeDescription === index ? '' : 'hidden'} text-[14px] lg:text-[16px] border border-t-0 border-default rounded-b-base shadow-xs`} aria-labelledby={`accordion-card-heading-${index}`}>
                           <div className="p-4 md:p-5">
                               <p className="mb-2 text-body">{item.ChapterDescription}</p>
                           </div>
                       </div>
                   </div>
               ))}
            </div>

        </>
    );
}