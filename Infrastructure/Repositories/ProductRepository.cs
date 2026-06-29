using Application.Interfaces;
using Entities.Models;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Product>> GetBySellerIdAsync(int sellerId)
    {
        return await _context.Products
            .Where(p => p.SellerId == sellerId && !p.IsDeleted)
            .ToListAsync();
    }
}
