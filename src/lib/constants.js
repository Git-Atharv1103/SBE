export const counterTypeOptions = [
  'Fast Food Counter',
  'Storage Area Equipment',
  'Shawarma Machine',
  'Bar Equipment',
  'Ss Table Equipment',
  'Commercial Kitchen',
  'Service Counter',
  'Bain Marie Counter',
  'Display Counter',
  'Sink Unit',
  'Work Table'
];

const fastFoodCounterTemplate = [
  {
    key: 'topSheet',
    name: 'Top Sheet',
    fields: {
      length: true,
      width: true,
      height: false,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'frontPanel',
    name: 'Front Panel',
    fields: {
      length: true,
      width: false,
      height: true,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'sidePanel',
    name: 'Side Panel',
    fields: {
      length: true,
      width: false,
      height: true,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'backPanel',
    name: 'Back Panel',
    fields: {
      length: true,
      width: false,
      height: true,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'bottomShelf',
    name: 'Bottom Shelf',
    fields: {
      length: true,
      width: true,
      height: false,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'upperShelf',
    name: 'Upper Shelf',
    fields: {
      length: true,
      width: true,
      height: false,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'frame',
    name: 'Frame',
    fields: {
      length: true,
      width: true,
      height: true,
      thickness: false,
      pipeSize: true,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'legs',
    name: 'Legs',
    fields: {
      length: false,
      width: false,
      height: true,
      thickness: false,
      pipeSize: true,
      noOfLegs: true,
      qty: true
    }
  },
  {
    key: 'drawer',
    name: 'Drawer',
    fields: {
      length: true,
      width: true,
      height: true,
      thickness: false,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'slidingDoor',
    name: 'Sliding Door',
    fields: {
      length: true,
      width: false,
      height: true,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'hinges',
    name: 'Hinges',
    fields: {
      length: false,
      width: false,
      height: false,
      thickness: false,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'handle',
    name: 'Handle',
    fields: {
      length: false,
      width: false,
      height: false,
      thickness: false,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'lock',
    name: 'Lock',
    fields: {
      length: false,
      width: false,
      height: false,
      thickness: false,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'wheels',
    name: 'Wheels',
    fields: {
      length: false,
      width: false,
      height: false,
      thickness: false,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'glass',
    name: 'Glass',
    fields: {
      length: true,
      width: false,
      height: true,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'shelfSupport',
    name: 'Shelf Support',
    fields: {
      length: true,
      width: false,
      height: false,
      thickness: false,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'splashBack',
    name: 'Splash Back',
    fields: {
      length: true,
      width: false,
      height: true,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'skirting',
    name: 'Skirting',
    fields: {
      length: true,
      width: false,
      height: true,
      thickness: true,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'fasteners',
    name: 'Fasteners',
    fields: {
      length: false,
      width: false,
      height: false,
      thickness: false,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  },
  {
    key: 'welding',
    name: 'Welding',
    fieldLabels: { length: 'Welding Length' },
    fields: {
      length: true,
      width: false,
      height: false,
      thickness: false,
      pipeSize: false,
      noOfLegs: false,
      qty: true
    }
  }
];

export const counterTypeMaterialTemplates = {
  'Fast Food Counter': fastFoodCounterTemplate,
  'Service Counter': fastFoodCounterTemplate,
  'Bain Marie Counter': fastFoodCounterTemplate,
  'Display Counter': fastFoodCounterTemplate,
  'Sink Unit': fastFoodCounterTemplate,
  'Work Table': fastFoodCounterTemplate,
  'Storage Area Equipment': fastFoodCounterTemplate,
  'Shawarma Machine': fastFoodCounterTemplate,
  'Bar Equipment': fastFoodCounterTemplate,
  'Ss Table Equipment': fastFoodCounterTemplate,
  'Commercial Kitchen': fastFoodCounterTemplate
};
