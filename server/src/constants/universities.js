const UNIVERSITIES = Object.freeze([
  {
    id: 'sliit',
    name: 'SLIIT (Sri Lanka Institute of Information Technology)',
    shortName: 'SLIIT',
    city: 'Malabe',
    popularSuburbs: ['Malabe', 'Kaduwela', 'Pothuarawa', 'Thalawathugoda', 'Battaramulla'],
  },
  {
    id: 'nsbm',
    name: 'NSBM Green University',
    shortName: 'NSBM',
    city: 'Homagama',
    popularSuburbs: ['Homagama', 'Pitipana', 'Meegoda', 'Kottawa', 'Godagama'],
  },
  {
    id: 'moratuwa',
    name: 'University of Moratuwa',
    shortName: 'UoM',
    city: 'Moratuwa',
    popularSuburbs: ['Katubedda', 'Moratuwa', 'Ratmalana', 'Molpe', 'Rawathawatta'],
  },
  {
    id: 'colombo',
    name: 'University of Colombo',
    shortName: 'UoC',
    city: 'Colombo',
    popularSuburbs: ['Colombo 03', 'Colombo 04', 'Colombo 07', 'Thimbirigasyaya', 'Havelock Town'],
  },
  {
    id: 'kelaniya',
    name: 'University of Kelaniya',
    shortName: 'UoK',
    city: 'Kelaniya',
    popularSuburbs: ['Kelaniya', 'Dalugama', 'Kiribathgoda', 'Peliyagoda', 'Wattala'],
  },
  {
    id: 'sjp',
    name: 'University of Sri Jayewardenepura',
    shortName: 'USJ',
    city: 'Nugegoda',
    popularSuburbs: ['Nugegoda', 'Gangodawila', 'Maharagama', 'Wijerama', 'Delkanda'],
  },
  {
    id: 'cinec',
    name: 'CINEC Campus',
    shortName: 'CINEC',
    city: 'Malabe',
    popularSuburbs: ['Malabe', 'Millennium City', 'Athurugiriya', 'Kaduwela'],
  },
  {
    id: 'horizon',
    name: 'Horizon Campus',
    shortName: 'Horizon',
    city: 'Malabe',
    popularSuburbs: ['Malabe', 'Chandrika Kumaratunga Mawatha', 'Kaduwela'],
  },
]);

const UNIVERSITY_NAMES = Object.freeze(UNIVERSITIES.map((u) => u.shortName));

module.exports = {
  UNIVERSITIES,
  UNIVERSITY_NAMES,
};
