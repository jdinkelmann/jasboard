import Weather from '../../components/widgets/Weather';
import Calendar from '../../components/widgets/Calendar';
import Photos from '../../components/widgets/Photos';
import Metar from '../../components/widgets/Metar';
import WoD from '../../components/widgets/WoD';

export default function Wood() {
  return (
    <main className="min-h-screen w-full bg-black text-white p-4">
          {/* Portrait layout: 1080x1920 */}
          <div className="max-w-[1080px] mx-auto h-screen flex flex-col gap-4">
            {/* Weather at top */}
            <section className="flex-shrink-0 grid grid-cols-2 gap-4 h-64">
              <Photos />
              <Metar />
            </section>

            {/* Calendar in middle - takes most space */}
            <section className="flex-grow overflow-hidden">
              <Calendar />
            </section>

            {/* Bottom section: Weather */}
            <section className="flex-shrink-0">
              <Weather />
            </section>

            {/* WOD section */}
            <section className="flex-shrink-0 h-64">
              <WoD />
            </section>

          </div>
        </main>
  );
}