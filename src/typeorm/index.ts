import { Auction } from './auction.entity';
import { AuctionToUser } from './auctionToUser.entity';
import { User } from './user.entity';

const entities = [User, Auction, AuctionToUser];

export { User, Auction, AuctionToUser};
export default entities;
