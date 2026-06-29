using Application.DTOs;

namespace Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(int userId, CreateProductDto createProductDto);
    Task<bool> UpdateProductAsync(int userId, UpdateProductDto updateProductDto);
    Task<bool> DeleteProductAsync(int userId, int id);
    Task<IEnumerable<ProductDto>> GetProductsBySellerIdAsync(int sellerId);
}