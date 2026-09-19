const AttendanceModel = require('../models/attendanceModel');
const OfficeLocationModel = require('../models/officeLocationModel');
const AttendanceScheduleModel = require('../models/attendanceScheduleModel');

class AttendanceService {
  static async getUserAttendance(userId) {
    return await AttendanceModel.getAllByUser(userId);
  }

  static async getAllAttendance() {
    return await AttendanceModel.getAll();
  }

  static getLocalDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static getLocalTimeString() {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  static async checkIn(userId, latitude, longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Koordinat GPS tidak valid');
    }

    // Check if already checked in today (menggunakan tanggal lokal)
    const today = this.getLocalDateString();
    const existingAttendance = await AttendanceModel.findByUserAndDate(userId, today);
    
    if (existingAttendance) {
      if (!existingAttendance.check_out_time) {
        throw new Error('Anda belum melakukan check-out untuk absensi sebelumnya');
      }
      throw new Error('Anda sudah melakukan absensi hari ini');
    }

    // Check if within office radius
    const officeLocation = await OfficeLocationModel.get();
    if (!officeLocation) {
      throw new Error('Lokasi kantor belum diatur oleh admin');
    }

    const distance = this.calculateDistance(
      { latitude: lat, longitude: lng },
      { latitude: Number(officeLocation.lat), longitude: Number(officeLocation.lng) }
    );

    if (distance > officeLocation.radius) {
      throw new Error(`Anda berada di luar area kantor (${Math.round(distance)}m dari kantor, maksimal ${officeLocation.radius}m)`);
    }

    // Check if within check-in time
    const schedule = await AttendanceScheduleModel.get();
    if (!schedule) {
      throw new Error('Jadwal absensi belum diatur oleh admin');
    }

    const currentTime = this.getLocalTimeString();
    
    if (currentTime < schedule.check_in_start || currentTime > schedule.check_in_end) {
      throw new Error(`Waktu absen masuk hanya diperbolehkan antara ${schedule.check_in_start.slice(0, 5)} - ${schedule.check_in_end.slice(0, 5)}`);
    }

    const status = 'present';
    return await AttendanceModel.create(userId, lat, lng, status);
  }

  static async checkOut(userId, latitude, longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Koordinat GPS tidak valid');
    }

    // Check if has checked in today (menggunakan tanggal lokal)
    const today = this.getLocalDateString();
    const existingAttendance = await AttendanceModel.findByUserAndDate(userId, today);
    
    if (!existingAttendance) {
      throw new Error('Anda belum melakukan check-in hari ini');
    }

    if (existingAttendance.check_out_time) {
      throw new Error('Anda sudah melakukan check-out hari ini');
    }

    // Check if within office radius
    const officeLocation = await OfficeLocationModel.get();
    if (!officeLocation) {
      throw new Error('Lokasi kantor belum diatur oleh admin');
    }

    const distance = this.calculateDistance(
      { latitude: lat, longitude: lng },
      { latitude: Number(officeLocation.lat), longitude: Number(officeLocation.lng) }
    );

    if (distance > officeLocation.radius) {
      throw new Error(`Anda berada di luar area kantor (${Math.round(distance)}m dari kantor, maksimal ${officeLocation.radius}m)`);
    }

    // Check if within check-out time
    const schedule = await AttendanceScheduleModel.get();
    if (!schedule) {
      throw new Error('Jadwal absensi belum diatur oleh admin');
    }

    const currentTime = this.getLocalTimeString();
    
    if (currentTime < schedule.check_out_start || currentTime > schedule.check_out_end) {
      throw new Error(`Waktu absen keluar hanya diperbolehkan antara ${schedule.check_out_start.slice(0, 5)} - ${schedule.check_out_end.slice(0, 5)}`);
    }

    const result = await AttendanceModel.updateCheckOut(userId, lat, lng);
    if (result === 0) {
      throw new Error('Tidak ada absensi masuk yang aktif');
    }
    return result;
  }

  static calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = this.toRadians(point1.latitude);
    const φ2 = this.toRadians(point2.latitude);
    const Δφ = this.toRadians(point2.latitude - point1.latitude);
    const Δλ = this.toRadians(point2.longitude - point1.longitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  static toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
}

module.exports = AttendanceService;