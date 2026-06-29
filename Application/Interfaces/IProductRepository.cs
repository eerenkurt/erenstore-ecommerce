using Entities.Models;

namespace Application.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<IEnumerable<Product>> GetBySellerIdAsync(int sellerId);
}
