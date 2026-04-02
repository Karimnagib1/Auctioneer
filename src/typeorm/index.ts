import { Auction } from './auction.entity';
import { AuctionImage } from './auctionImage.entity';
import { AuctionToUser } from './auctionToUser.entity';
import { Notification } from './notification.entity';
import { ProxyBid } from './proxyBid.entity';
import { User } from './user.entity';

const entities = [User, Auction, AuctionToUser, ProxyBid, Notification, AuctionImage];

export { User, Auction, AuctionToUser, ProxyBid, Notification, AuctionImage };
export default entities;
