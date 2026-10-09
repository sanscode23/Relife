const generatePathways = (device) => {
  const recommendedAction = device.recommendation?.action || 'CONTINUE_USING';
  const queryModel = encodeURIComponent(`${device.brand} ${device.model}`);

  const pathways = [
    {
      pathwayId: 'path_repair',
      title: 'Local Authorized Repair & Battery Service',
      description: 'Extend device lifespan by replacing degraded battery or damaged screen with certified technicians.',
      recommended: ['REPAIR_AND_REUSE', 'REPAIR_AND_RESELL', 'CONTINUE_USING'].includes(recommendedAction),
      category: 'REPAIR',
      externalLinks: [
        {
          label: 'Find Nearby Repair Centers (Google Maps)',
          url: `https://www.google.com/maps/search/electronics+repair+near+me+${queryModel}`,
        },
        {
          label: 'Search Spare Parts Price Guide',
          url: `https://www.google.com/search?q=${queryModel}+spare+parts+price+india`,
        },
      ],
      notes: 'Replacing battery or screen restores performance for up to 3 additional years.',
    },
    {
      pathwayId: 'path_resell',
      title: 'Direct Second-Hand Resale Marketplace',
      description: 'Sell directly to buyers or verified refurbished platforms after completing data sanitization.',
      recommended: ['SELL', 'REPAIR_AND_RESELL'].includes(recommendedAction),
      category: 'RESELL',
      externalLinks: [
        {
          label: 'Search Cashify Buyback Estimates',
          url: `https://www.cashify.in/sell-old-laptop/search?q=${queryModel}`,
        },
        {
          label: 'List on OLX Marketplace',
          url: `https://www.olx.in/items/q-${queryModel}`,
        },
      ],
      notes: 'Complete RE:LIFE Data Safety Checklist to generate a trustworthy Verification Certificate before listing.',
    },
    {
      pathwayId: 'path_donate',
      title: 'Educational & Community Electronics Donation',
      description: 'Donate functional devices to schools, non-profits, or community learning centers in need.',
      recommended: recommendedAction === 'DONATE',
      category: 'DONATE',
      externalLinks: [
        {
          label: 'Goonj Electronics Reuse Initiative',
          url: 'https://goonj.org',
        },
        {
          label: 'Search Local Digital Divide Charities',
          url: `https://www.google.com/search?q=electronics+donation+NGO+India+${queryModel}`,
        },
      ],
      notes: 'Includes full verification certificate to prove data safety prior to handoff.',
    },
    {
      pathwayId: 'path_repurpose',
      title: 'Repurpose into Dedicated Home Server / Smart Display',
      description: 'Turn your device into a media server, digital dashboard, Linux home lab, or smart display.',
      recommended: recommendedAction === 'REPURPOSE',
      category: 'REPURPOSE',
      externalLinks: [
        {
          label: 'Home Assistant & Linux Repurposing Guides',
          url: `https://www.google.com/search?q=repurpose+old+${device.deviceType.toLowerCase()}+linux+home+server`,
        },
        {
          label: 'Explore HomeLab Projects',
          url: 'https://github.com/awesome-selfhosted/awesome-selfhosted',
        },
      ],
      notes: 'Zero cost transformation that keeps hardware productive indefinitely.',
    },
    {
      pathwayId: 'path_recycle',
      title: 'Certified E-Waste Recycling & Material Recovery',
      description: 'Ensure non-repairable devices are responsibly recycled in accordance with E-Waste Management Rules.',
      recommended: ['RECYCLE', 'COMPONENT_RECOVERY'].includes(recommendedAction),
      category: 'RECYCLE',
      externalLinks: [
        {
          label: 'Find CPCB Authorized E-Waste Recyclers',
          url: 'https://cpcb.nic.in/e-waste-management/',
        },
        {
          label: 'Search Local E-Waste Collection Bins',
          url: 'https://www.google.com/maps/search/e-waste+recycling+center+near+me',
        },
      ],
      notes: 'Prevents toxic heavy metals from leaching into landfills and recovers gold, copper, and rare earths.',
    },
  ];

  return {
    disclaimer:
      'RE:LIFE provides external search and handoff links for informational guidance only. RE:LIFE has no commercial partnership or endorsement with external service providers.',
    pathways,
  };
};

module.exports = {
  generatePathways,
};
