import { requireCarrier } from "@/lib/dal";
import { regionsFor } from "@/lib/matching";
import { CarrierProfileForm } from "@/components/CarrierProfileForm";
import { Card } from "@/components/ui";
import { VEHICLE_LABELS } from "@/lib/constants";

export default async function ProfilePage() {
  const user = await requireCarrier();
  const acceptsRegions = regionsFor(user.acceptsRegions);
  const incomplete = !user.vehicleType || !user.currentRegion;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Your profile</h1>
        <p className="mt-1 text-sm text-muted">
          Hi {user.name.split(" ")[0]} — tell us about your truck so we can match you with the right loads.
        </p>
      </div>

      {incomplete && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm text-brand-dark">
          Complete your profile to start seeing compatible loads.
        </div>
      )}

      <Card>
        <CarrierProfileForm
          initial={{
            vehicleType: user.vehicleType,
            vehiclePlate: user.vehiclePlate,
            professionalLicense: user.professionalLicense,
            phone: user.phone,
            currentRegion: user.currentRegion,
            acceptsRegions,
            available: user.available,
          }}
        />
      </Card>

      <Card className="bg-transparent shadow-none border-0 space-y-1.5">
        <p className="text-sm text-muted">
          {user.vehicleType ? (
            <>Vehicle: <span className="font-semibold text-ink">{VEHICLE_LABELS[user.vehicleType]}</span></>
          ) : (
            "No vehicle selected yet."
          )}
        </p>
        {user.vehiclePlate && (
          <p className="text-sm text-muted">
            Plate: <span className="font-semibold text-ink">{user.vehiclePlate}</span>
          </p>
        )}
        {user.phone && (
          <p className="text-sm text-muted">
            Phone: <span className="font-semibold text-ink">{user.phone}</span>
          </p>
        )}
      </Card>
    </div>
  );
}
