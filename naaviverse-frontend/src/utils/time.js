export const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const suffix = getSuffix(day);
    const month = getMonthName(date.getMonth());
    const year = date.getFullYear();
  
    return `${month} ${day}${suffix} ${year}`;
  }
  
  function getMonthName(monthIndex) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  }
  
  function getSuffix(day) {
    const suffixes = ["th", "st", "nd", "rd"];
    const suffix =
      day % 10 === 1 && day !== 11
        ? suffixes[1]
        : day % 10 === 2 && day !== 12
        ? suffixes[2]
        : day % 10 === 3 && day !== 13
        ? suffixes[3]
        : suffixes[0];
    return suffix;
  }
  