import Weather from '../components/widgets/Weather';
import Calendar from '../components/widgets/Calendar';
import Photos from '../components/widgets/Photos';
import Metar from '../components/widgets/Metar';

/**
 * JasBoard Main Display
 *
 * Portrait layout (1080x1920) with theme support
 * Background image is applied via body element in globals.css
 */
export default function Home() {
  return (
    <main className="min-h-screen w-full p-4">
      {/* Portrait layout: 1080x1920 */}
      <div className="max-w-[1080px] mx-auto h-screen flex flex-col gap-4">
        {/* Weather at top */}
        <section className="flex-shrink-0">
          <Weather />
        </section>

        {/* Calendar in middle - takes most space */}
        <section className="flex-grow overflow-hidden">
          <Calendar />
        </section>

        {/* Bottom section: Photos and METAR side by side */}
        <section className="flex-shrink-0 grid grid-cols-2 gap-4 h-64">
          <Photos />
          <Metar />
        </section>
      </div>
    </main>
  );
}
