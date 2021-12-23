## Design Pattern Decisions

### Contract Inheritance
) In order to take advantage of the most battle tested code, utilized OpenZepplin library to inherit and utilize the following contracts: ERC721, ERC721URIStorage, ERC721Holder, Counters, & ReentrancyGuard.

### Inter-Contract Executions
) Utilized safeTransfer functions on all token tranfser functions: creator to market & market to buyer.

) Utilized Counters to safely increment both the _token & _item Ids.

### Checks-Effects-Interactions
) Utilized Checks-Effects-Interactions pattern placing all interactions at the bottom of functions after state changes have been applied to help avoid reentrancy risk.
