export default function EndTestBtn({ onClick }) {
    return (
        <button type="button" className="text-[var(--primary-red)] bg-neutral-primary border border-[var(--primary-red)] hover:bg-[var(--primary-red)] hover:text-white focus:ring-4 focus:ring-[var(--primary-red)-subtle] font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none mt-2" 
        onClick={onClick}
        >End Test</button>
    );
}