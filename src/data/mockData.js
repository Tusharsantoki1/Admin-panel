const NAMES = [
  ['Alice','Walker'],['Bob','Chen'],['Clara','Smith'],['David','Lee'],
  ['Emma','Jones'],['Fiona','Brown'],['George','Taylor'],['Hannah','White'],
  ['Ian','Harris'],['Julia','Martin'],['Kevin','Davis'],['Laura','Wilson'],
  ['Mike','Anderson'],['Nina','Thomas'],['Oscar','Jackson'],['Priya','Moore'],
  ['Quinn','Martinez'],['Rachel','Garcia'],['Sam','Lopez'],['Tina','Rodriguez'],
];
const COUNTRIES = ['United States','United Kingdom','India','Canada','Australia','Germany','France','Brazil','Japan','Singapore'];
const STATES    = ['California','New York','Texas','Ontario','Maharashtra','Bavaria','Île-de-France','Queensland','Tokyo','NSW'];
const CITIES    = ['San Francisco','London','Mumbai','Toronto','Sydney','Berlin','Paris','Brisbane','Tokyo','Singapore'];
const PLANS     = ['PLN-001','PLN-002','PLN-003','PLN-004'];
const ROLES     = ['Admin','User','Manager'];
const STATUSES  = ['Active','Active','Active','Inactive','Away'];
const GROUPS    = ['Group A','Group B','Group C'];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndDate(ys, ye) {
  const s = new Date(ys, 0, 1), e = new Date(ye, 11, 31);
  return new Date(s.getTime() + Math.random() * (e.getTime() - s.getTime()))
    .toISOString().split('T')[0];
}

export function generateUsers(count = 60) {
  return Array.from({ length: count }, (_, i) => {
    const [fn, ln] = NAMES[i % NAMES.length];
    const idx = Math.floor(Math.random() * COUNTRIES.length);
    return {
      id: i + 1,
      first_name: fn + (i > 19 ? i : ''),
      last_name: ln,
      email: `${fn.toLowerCase()}${i + 1}@example.com`,
      phone_number: `+1 ${Math.floor(Math.random()*900+100)} ${Math.floor(Math.random()*900+100)} ${Math.floor(Math.random()*9000+1000)}`,
      country: COUNTRIES[idx],
      state: STATES[idx] || 'N/A',
      city: CITIES[idx] || 'N/A',
      status: rnd(STATUSES),
      created_at: rndDate(2022, 2024),
      activateDate: rndDate(2022, 2024),
      expiryDate: rndDate(2025, 2026),
      planId: rnd(PLANS),
      isMobileVerified: Math.random() > 0.4,
      isEmailVerified: Math.random() > 0.3,
      role: rnd(ROLES),
      permissionId: `PERM-${Math.floor(Math.random() * 4) + 1}`,
      broker_addon: Math.random() > 0.5 ? 'Yes' : 'No',
      active_broker: Math.random() > 0.5 ? 'Yes' : 'No',
      group: rnd(GROUPS),
    };
  });
}

const COUPON_CODES = ['SAVE10','FLAT20','HALF50','PROMO15','DEAL25','OFFER30','BONUS5','VIP40'];
export function generateCoupons(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    code: COUPON_CODES[i % COUPON_CODES.length] + i,
    discount: Math.floor(Math.random() * 50 + 5),
    type: Math.random() > 0.5 ? 'Percentage' : 'Fixed',
    status: Math.random() > 0.3 ? 'Active' : 'Inactive',
    uses: Math.floor(Math.random() * 200),
    max_uses: Math.floor(Math.random() * 500 + 100),
    expiry: rndDate(2024, 2026),
    created_at: rndDate(2022, 2024),
  }));
}

const PLAN_NAMES = ['Starter','Basic','Pro','Business','Enterprise','Ultimate'];
export function generatePlans(count = 12) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: PLAN_NAMES[i % PLAN_NAMES.length],
    price: [0, 9.99, 19.99, 29.99, 49.99, 99.99][i % 6],
    billing: rnd(['Monthly','Annual','Lifetime']),
    features: ['Up to 5 users','Analytics','Priority support','Custom domains','API access','White labeling'][i % 6],
    users: Math.floor(Math.random() * 500 + 10),
    status: Math.random() > 0.2 ? 'Active' : 'Inactive',
    created_at: rndDate(2022, 2024),
  }));
}

const PERM_NAMES = ['users.read','users.write','users.delete','coupons.manage','plans.manage','reports.view','settings.edit','billing.view'];
const MODULES    = ['Users','Coupons','Plans','Reports','Settings','Billing'];
export function generatePermissions(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: PERM_NAMES[i % PERM_NAMES.length],
    module: rnd(MODULES),
    access: rnd(['Read','Write','Full']),
    assigned: rnd(['Admin','Manager','Admin, Manager']),
    created_at: rndDate(2022, 2024),
    status: Math.random() > 0.2 ? 'Active' : 'Inactive',
  }));
}
