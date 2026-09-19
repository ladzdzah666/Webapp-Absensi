const db = require('../config/db');

class OfficeLocationModel {
  static async get() {
    const [location] = await db.query(
      "SELECT id, lat, lng, radius FROM office_location LIMIT 1"
    );
    if (!location[0]) {
      return {
        lat: -7.446754760104717,
        lng: 109.24140415854745,
        radius: 100
      };
    }
    return {
      id: location[0].id,
      lat: Number(location[0].lat),
      lng: Number(location[0].lng),
      radius: Number(location[0].radius)
    };
  }

  static async update(lat, lng, radius) {
    await db.query(
      "REPLACE INTO office_location (id, lat, lng, radius) VALUES (1, ?, ?, ?)",
      [lat, lng, radius]
    );
  }
}

module.exports = OfficeLocationModel;