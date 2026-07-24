export const DUMMY_ROUTES = [
  {
    id: "route-1",
    from: "Nagaur (NGO)",
    to: "Bhubaneswar (BBS)",
    date: "2023-11-20",
    journeyTime: "34h 15m",
    totalDistance: "1,850 km",
    totalFare: "₹2,450",
    transfers: 1,
    reliabilityScore: 88,
    riskLevel: "Low", // "Low", "Medium", "High"
    legs: [
      {
        id: "leg-1",
        trainNumber: "14813",
        trainName: "BME DEE EXP",
        from: "Nagaur (NGO)",
        to: "Delhi (DEE)",
        departure: "06:00",
        arrival: "14:15",
        duration: "8h 15m",
        distance: "450 km",
        fare: "₹450"
      },
      {
        id: "transfer-1",
        type: "transfer",
        station: "Delhi (NDLS)",
        waitTime: "2h 45m",
        status: "Comfortable", // "Comfortable", "Risky", "Very Risky"
      },
      {
        id: "leg-2",
        trainNumber: "12802",
        trainName: "PURUSHOTTAM EXP",
        from: "Delhi (NDLS)",
        to: "Bhubaneswar (BBS)",
        departure: "17:00",
        arrival: "16:15", // Next day
        duration: "23h 15m",
        distance: "1,400 km",
        fare: "₹2,000"
      }
    ]
  },
  {
    id: "route-2",
    from: "Nagaur (NGO)",
    to: "Bhubaneswar (BBS)",
    date: "2023-11-20",
    journeyTime: "36h 30m",
    totalDistance: "1,920 km",
    totalFare: "₹2,650",
    transfers: 2,
    reliabilityScore: 75,
    riskLevel: "Medium",
    legs: [
      {
        id: "leg-3",
        trainNumber: "22422",
        trainName: "JU DEE SF EXP",
        from: "Nagaur (NGO)",
        to: "Delhi (DEE)",
        departure: "12:00",
        arrival: "20:00",
        duration: "8h 0m",
        distance: "450 km",
        fare: "₹500"
      },
      {
        id: "transfer-2",
        type: "transfer",
        station: "Delhi (NDLS)",
        waitTime: "1h 30m",
        status: "Risky", 
      },
      {
        id: "leg-4",
        trainNumber: "12314",
        trainName: "SEALDAH RAJDHANI",
        from: "Delhi (NDLS)",
        to: "Kanpur (CNB)",
        departure: "21:30",
        arrival: "02:00", 
        duration: "4h 30m",
        distance: "440 km",
        fare: "₹1,200"
      },
      {
        id: "transfer-3",
        type: "transfer",
        station: "Kanpur (CNB)",
        waitTime: "2h 0m",
        status: "Comfortable", 
      },
      {
        id: "leg-5",
        trainNumber: "12876",
        trainName: "NEELACHAL EXP",
        from: "Kanpur (CNB)",
        to: "Bhubaneswar (BBS)",
        departure: "04:00",
        arrival: "00:30", 
        duration: "20h 30m",
        distance: "1,030 km",
        fare: "₹950"
      }
    ]
  },
  {
    id: "route-3",
    from: "Delhi (NDLS)",
    to: "Mumbai (CSMT)",
    date: "2023-11-20",
    journeyTime: "15h 40m",
    totalDistance: "1,384 km",
    totalFare: "₹4,500",
    transfers: 0,
    reliabilityScore: 98,
    riskLevel: "Low",
    legs: [
      {
        id: "leg-6",
        trainNumber: "12952",
        trainName: "MMCT TEJAS RAJ",
        from: "Delhi (NDLS)",
        to: "Mumbai (MMCT)",
        departure: "16:55",
        arrival: "08:35",
        duration: "15h 40m",
        distance: "1,384 km",
        fare: "₹4,500"
      }
    ]
  }
];

export const POPULAR_ROUTES = [
  { from: "Delhi", to: "Mumbai", trend: "up" },
  { from: "Nagaur", to: "Bhubaneswar", trend: "up" },
  { from: "Patna", to: "Bangalore", trend: "neutral" },
  { from: "Kolkata", to: "Jaipur", trend: "down" },
];
