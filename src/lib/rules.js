// Centralized business rules from the TransitOps problem statement (Section 4).
// Keeping these in one file makes them easy to unit-test and demo.

export function isVehicleDispatchable(vehicle) {
  // Retired or In Shop vehicles must never appear in dispatch selection.
  return vehicle.status === "Available";
}

export function isDriverAssignable(driver) {
  // Drivers with expired licenses or Suspended status cannot be assigned.
  const expired = new Date(driver.licenseExpiry) < new Date();
  return driver.status === "Available" && !expired;
}

export function isCargoWithinCapacity(cargoWeight, vehicleCapacity) {
  return Number(cargoWeight) <= Number(vehicleCapacity);
}

export function validateTripDispatch({ vehicle, driver, cargoWeight }) {
  const errors = [];
  if (!vehicle) errors.push("Select a vehicle.");
  if (!driver) errors.push("Select a driver.");
  if (vehicle && !isVehicleDispatchable(vehicle)) {
    errors.push(`Vehicle ${vehicle.regNo} is currently "${vehicle.status}" — not available.`);
  }
  if (driver && !isDriverAssignable(driver)) {
    errors.push(`Driver ${driver.name} is not assignable (suspended or license expired).`);
  }
  if (vehicle && cargoWeight && !isCargoWithinCapacity(cargoWeight, vehicle.capacity)) {
    errors.push(
      `Cargo weight ${cargoWeight}kg exceeds vehicle capacity ${vehicle.capacity}kg — dispatch blocked.`
    );
  }
  return { valid: errors.length === 0, errors };
}

export function calcFuelEfficiency(distanceKm, litersUsed) {
  if (!litersUsed) return 0;
  return +(distanceKm / litersUsed).toFixed(1);
}

export function calcFleetUtilization(vehicles) {
  if (!vehicles.length) return 0;
  const onTrip = vehicles.filter((v) => v.status === "On Trip").length;
  return +((onTrip / vehicles.length) * 100).toFixed(0);
}

export function calcOperationalCost(fuelLogs, maintenanceLogs, vehicleRegNo) {
  const fuel = fuelLogs
    .filter((f) => f.vehicleRegNo === vehicleRegNo)
    .reduce((sum, f) => sum + Number(f.cost || 0), 0);
  const maint = maintenanceLogs
    .filter((m) => m.vehicleRegNo === vehicleRegNo)
    .reduce((sum, m) => sum + Number(m.cost || 0), 0);
  return fuel + maint;
}

export function calcVehicleROI({ revenue, maintenanceCost, fuelCost, acquisitionCost }) {
  if (!acquisitionCost) return 0;
  const roi = (revenue - (maintenanceCost + fuelCost)) / acquisitionCost;
  return +(roi * 100).toFixed(1); // as %
}

export const VEHICLE_STATUSES = ["Available", "On Trip", "In Shop", "Retired"];
export const DRIVER_STATUSES = ["Available", "On Trip", "Off Duty", "Suspended"];
export const TRIP_STATUSES = ["Draft", "Dispatched", "Completed", "Cancelled"];
