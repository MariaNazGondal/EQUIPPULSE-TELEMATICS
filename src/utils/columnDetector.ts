export interface FlexibleColumnMap {
  assetIdKey?: string;
  assetNameKey?: string;
  equipmentTypeKey?: string;
  imeiKey?: string;
  serialKey?: string;
  planTierKey?: string;
  startDateKey?: string;
  endDateKey?: string;
  billingCycleKey?: string;
  rateKey?: string;
  addonsKey?: string;
  addonFeeKey?: string;
  statusKey?: string;
  uptimeKey?: string;
  customerKey?: string;
  siteKey?: string;
  currencyKey?: string;
}

export function detectColumnKeys(firstRow: Record<string, any>): FlexibleColumnMap {
  const map: FlexibleColumnMap = {};
  if (!firstRow) return map;

  const keys = Object.keys(firstRow);

  const findKey = (patterns: RegExp[]): string | undefined => {
    return keys.find(k => {
      const clean = k.trim().toLowerCase().replace(/[\s_\-.]+/g, '');
      return patterns.some(p => p.test(clean));
    });
  };

  map.assetIdKey = findKey([/^assetid$/, /^asset$/, /^equipmentid$/, /^machineid$/, /^unitid$/, /^id$/]);
  map.assetNameKey = findKey([/^assetname$/, /^equipmentname$/, /^machinename$/, /^machine$/, /^equipment$/, /^model$/, /^description$/, /^name$/]);
  map.equipmentTypeKey = findKey([/^equipmenttype$/, /^type$/, /^category$/, /^machinetype$/]);
  map.imeiKey = findKey([/^telematicsimei$/, /^imei$/, /^modem$/, /^modemimei$/, /^deviceid$/, /^serialimei$/, /^cellularimei$/]);
  map.serialKey = findKey([/^serialnumber$/, /^serial$/, /^sn$/, /^vin$/, /^chassis$/]);
  map.planTierKey = findKey([/^plantier$/, /^tier$/, /^plan$/, /^package$/, /^subscription$/, /^subscriptiontier$/, /^serviceplan$/]);
  map.startDateKey = findKey([/^contractstartdate$/, /^startdate$/, /^start$/, /^contractstart$/, /^from$/, /^begindate$/, /^effective$/]);
  map.endDateKey = findKey([/^contractenddate$/, /^enddate$/, /^end$/, /^contractend$/, /^to$/, /^expiry$/, /^expirationdate$/, /^termend$/]);
  map.billingCycleKey = findKey([/^billingcycle$/, /^cycle$/, /^frequency$/, /^term$/]);
  map.rateKey = findKey([/^monthlyrate$/, /^rate$/, /^price$/, /^monthlyfee$/, /^fee$/, /^amount$/, /^cost$/, /^unitrate$/]);
  map.addonsKey = findKey([/^addons$/, /^addon$/, /^features$/, /^options$/]);
  map.addonFeeKey = findKey([/^addonfee$/, /^addonrate$/, /^extrafee$/]);
  map.statusKey = findKey([/^status$/, /^state$/, /^machinestatus$/, /^operstatus$/]);
  map.uptimeKey = findKey([/^slauptimepercent$/, /^slauptime$/, /^uptime$/, /^sla$/, /^availability$/, /^uptimepercent$/]);
  map.customerKey = findKey([/^customername$/, /^customer$/, /^company$/, /^client$/, /^organization$/, /^account$/, /^companyname$/, /^billedto$/]);
  map.siteKey = findKey([/^sitelocation$/, /^site$/, /^location$/, /^projectsite$/, /^project$/, /^jobsite$/]);
  map.currencyKey = findKey([/^currency$/, /^cur$/, /^valuta$/]);

  return map;
}

export function extractCustomerNameFromRows(rows: any[], filename?: string): string {
  if (!rows || rows.length === 0) {
    if (filename) {
      const clean = filename.replace(/\.(xlsx|xls|csv)$/i, '').replace(/[-_]+/g, ' ').trim();
      if (clean) return clean;
    }
    return 'Customer Fleet Account';
  }

  const map = detectColumnKeys(rows[0]);
  if (map.customerKey) {
    for (const r of rows) {
      const val = String(r[map.customerKey] || '').trim();
      if (val && val.toLowerCase() !== 'null' && val.toLowerCase() !== 'undefined') {
        return val;
      }
    }
  }

  // Check if any row key has 'Beta Industries' or similar
  for (const r of rows) {
    for (const [k, v] of Object.entries(r)) {
      const strVal = String(v).trim();
      const strKey = String(k).trim();
      if (strVal.toLowerCase().includes('beta') || strVal.toLowerCase().includes('industries') || strVal.toLowerCase().includes('corp') || strVal.toLowerCase().includes('ltd')) {
        return strVal;
      }
      if (strKey.toLowerCase().includes('beta') || strKey.toLowerCase().includes('industries')) {
        return strKey;
      }
    }
  }

  if (filename) {
    const clean = filename.replace(/\.(xlsx|xls|csv)$/i, '').replace(/[-_]+/g, ' ').trim();
    if (clean && clean.length > 2) return clean;
  }

  return 'Customer Fleet Account';
}
