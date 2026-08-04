import React from "react";
export default function ScoreCards({ score, total }) {
  return (
    <>
      <div className="rounded-md border bg-white transition-all duration-200 border-gray-500 shadow-sm">
        <div className="sm:p-6 sm:pt-0 p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 bg-blue-100 rounded-md">
              <i className="ri-award-line text-lg md:text-xl text-blue-600"></i>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Your Score
            </h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl md:text-5xl font-bold text-blue-600"
              data-test-id="pause-test-score"
            >
              {score}
            </span>
            <span
              className="text-xl md:text-2xl font-semibold text-gray-500"
              data-test-id="pause-test-total"
            >
              /{total}
            </span>
          </div>
          <div className="inline-flex items-center border px-2.5 py-0.5 font-semibold transition-all duration-200 border-transparent bg-primary-accent text-primary hover:bg-primary-accent/80 mt-3 md:mt-4 rounded-md text-xs">
            0% Overall
          </div>
        </div>
      </div>
    </>
  );
}
