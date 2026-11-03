import BASE_PATH from '@/lib/basePath';

export type AnimationAsset = { id: string; label: string; alt: string; poster: string; webm: string; packed: string };
function asset(id: string, label: string, alt: string): AnimationAsset {
    const base = `${BASE_PATH}/media/animations/${id}`;
    return { id, label, alt, poster: `${base}-poster.png`, webm: `${base}-alpha.webm`, packed: `${base}-mask-720.mp4` };
}
export const homeAnimation = asset('aerial-v7-van', 'homepage drone scan', 'Drone surveying a landscaped building with an orange-and-black landing pad and TRAVIS van');
export const intelligenceAnimation = asset('services-intelligence', 'Applied Intelligence', 'Drone capture, thermal inspection and reporting beside a parked TRAVIS van');
export const designAnimation = asset('services-design', 'Engineering Design', 'Workers and a TRAVIS van beside a barn on a rectangular construction base');
export const damageAnimation = asset('services-damage', 'Damage Assessments', 'TRAVIS van arriving for a four-sided house inspection and assessment report');
