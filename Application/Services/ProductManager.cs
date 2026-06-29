using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Entities.Models;

namespace Application.Services;

public class ProductManager : IProductService
{
    private readonly IRepository<User> _userRepository;
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public ProductManager(IProductRepository productRepository, IMapper mapper, IRepository<User> userRepository)
    {
        _productRepository = productRepository;
        _mapper = mapper;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await _productRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        return product is null ? null : _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> CreateProductAsync(int userId, CreateProductDto createProductDto)
    {
        var seller = await _userRepository.GetByIdAsync(userId);
    
        // önce null kontrolü
        if (seller == null)
        {
            throw new KeyNotFoundException($"Veritabanında Id'si {userId} olan bir satıcı bulunamadı! Lütfen güncel bir token ile istek attığınızdan emin olun.");
        }

        // nesnenin varlığından emin olduktan sonra mülklerini kontrol edebiliriz
        if (seller.UserType == Entities.Enums.UserTypes.Seller && 
            seller.SellerStatus != Entities.Enums.SellerStatus.Approved)
        {
            throw new InvalidOperationException("Ürün ekleyebilmek için mağazanızın Admin tarafından onaylanması gerekmektedir.");
        }

        var product = _mapper.Map<Product>(createProductDto);
        product.SellerId = userId;
        product.CreatedDate = DateTime.UtcNow;
        product.IsDeleted = false;
        product.IsActive = true;

        if (string.IsNullOrEmpty(product.Description))
        {
            product.Description = "Açıklama belirtilmedi.";
        }

        await _productRepository.AddAsync(product);
        await _productRepository.SaveChangesAsync();
    
        return _mapper.Map<ProductDto>(product);
    }

    public async Task<bool> UpdateProductAsync(int userId, UpdateProductDto updateProductDto)
    {
        var product = await _productRepository.GetByIdAsync(updateProductDto.Id);
        if (product is null) return false;

        if (product.SellerId != userId)
            throw new UnauthorizedAccessException("Bu ürünü güncelleme yetkiniz bulunmamaktadır.");

        _mapper.Map(updateProductDto, product);

        await _productRepository.UpdateAsync(product);
        await _productRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteProductAsync(int userId, int id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product is null) return false;

        if (product.SellerId != userId)
            throw new UnauthorizedAccessException("Bu ürünü silme yetkiniz bulunmamaktadır.");

        await _productRepository.DeleteAsync(product);
        await _productRepository.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<ProductDto>> GetProductsBySellerIdAsync(int sellerId)
    {
        var products = await _productRepository.GetBySellerIdAsync(sellerId);
        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }
}