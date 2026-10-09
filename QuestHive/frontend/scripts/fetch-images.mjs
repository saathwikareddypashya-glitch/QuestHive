// Downloads demo teacher portraits into public/images/teachers so the app works offline.
// Usage: npm run fetch-images   (needs internet once)
import { writeFile, mkdir } from 'node:fs/promises';

const portraits = {
  t1: 'women/44', t2: 'women/68', t3: 'women/21', t4: 'men/32', t5: 'women/65',
  t6: 'men/46', t7: 'women/12', t8: 'men/75', t9: 'women/90', t10: 'men/22',
  t11: 'women/33', t12: 'men/52', t13: 'women/57', t14: 'men/61', t15: 'women/79',
  t16: 'men/14', t17: 'women/26', t18: 'men/85',
  t19: 'women/31', t20: 'men/43', t21: 'women/52', t22: 'men/28', t23: 'women/36', t24: 'men/58',
  t25: 'women/48', t26: 'men/63', t27: 'women/19', t28: 'men/70', t29: 'men/11', t30: 'women/60',
  t31: 'men/44', t32: 'women/24', t33: 'men/38', t34: 'women/40', t35: 'men/34', t36: 'women/45',
  t37: 'women/66', t38: 'men/48', t39: 'women/29', t40: 'men/54',
  p1: 'women/5', p2: 'men/3', p3: 'women/8', p4: 'men/9', p5: 'women/15', r1: 'men/17',
};

await mkdir('public/images/teachers', { recursive: true });
for (const [id, path] of Object.entries(portraits)) {
  const url = `https://randomuser.me/api/portraits/${path}.jpg`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    await writeFile(`public/images/teachers/${id}.jpg`, Buffer.from(await res.arrayBuffer()));
    console.log('✓', id);
  } catch (e) {
    console.log('✕', id, e.message);
  }
}
console.log('Done. Images saved to public/images/teachers/');
