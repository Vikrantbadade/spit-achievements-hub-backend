export const getYearRange = (start = 2010, end = 2032) => {
    const years = [];
    for (let year = end; year >= start; year--) {
        years.push(year.toString());
    }
    return years;
};

export const currentYear = new Date().getFullYear().toString();
