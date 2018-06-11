export class Constants {
  public static colonyNameToIdMapping = {
    'algorithms': 1,
    'data-structures': 2
  }

  public static colonyToDomainMapping = 
  {
    'algorithms': {
      '0': { name: 'Search', slug: 'search' },
      '1': { name: 'Strings', slug: 'strings' },
      '2': { name: 'Sorting', slug: 'sorting' },
      '3': { name: 'Greedy', slug: 'greedy' },
      '4': { name: 'Dynamic Programming', slug: 'dp' },
      '5': { name: 'Miscellaneous', slug: 'misc' }
    },
    'data-structures': {
      '0': { name: 'Linked Lists', slug: 'linked-lists' },
      '1': { name: 'Arrays', slug: 'arrays' },
      '2': { name: 'Stacks/Queues', slug: 'stacks-queues' },
      '3': { name: 'Trees', slug: 'trees' },
      '4': { name: 'Hash/Maps', slug: 'hash-maps' },
      '5': { name: 'Graphs', slug: 'graphs' }
    }
  }

  public static domainNameToIdMapping = 
  {
    'algorithms': {
      'search': 0,
      'strings': 1,
      'sorting': 2,
      'greedy': 3,
      'dp': 4,
      'misc': 5
    },
    'data-structures': {
      'linked-lists': 0,
      'arrays': 1,
      'stacks-queues': 2,
      'trees': 3,
      'hash-maps': 4,
      'graphs': 5
    },
  }
}