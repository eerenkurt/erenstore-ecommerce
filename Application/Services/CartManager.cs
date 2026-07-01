using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Entities.Models;

namespace Application.Services;

public class CartManager : ICartService
{
    private readonly IRepository<CartItem> _cartItemRepository;
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public CartManager(IRepository<CartItem> cartItemRepository, IProductRepository productRepository, IMapper mapper)
    {
        _cartItemRepository = cartItemRepository;
        _productRepository = productRepository;
        _mapper = mapper;
    }

    // sepeti ürün bilgisiyle birlikte getiriyoruz
    public async Task<CartDto> GetCartAsync(int customerId)
    {
        var items = await _cartItemRepository.GetAllAsync(
            ci => ci.CustomerId == customerId,
            "Product"
        );

        var itemDtos = _mapper.Map<List<CartItemDto>>(items);

        return new CartDto
        {
            Items = itemDtos,
            TotalAmount = itemDtos.Sum(i => i.LineTotal)
        };
    }

    public async Task AddToCartAsync(int customerId, AddToCartDto dto)
    {
        var product = await _productRepository.GetByIdAsync(dto.ProductId);
        if (product == null)
            throw new KeyNotFoundException($"Id'si {dto.ProductId} olan ürün bulunamadı.");

        // stok kontrolü 
        if (product.Stock < dto.Quantity)
            throw new InvalidOperationException($"'{product.Name}' ürünü için yetersiz stok! Kalan stok: {product.Stock}");

        // müşterinin bu üründen sepette zaten bir satırı var mı diye bakıyoruz
        var existingItems = await _cartItemRepository.GetAllAsync(
            ci => ci.CustomerId == customerId && ci.ProductId == dto.ProductId
        );
        var existingItem = existingItems.FirstOrDefault();

        if (existingItem != null)
        {
            // varsa adedini artırıyoruz
            existingItem.Quantity += dto.Quantity;
            await _cartItemRepository.UpdateAsync(existingItem);
        }
        else
        {
            // yoksa yeni satır oluşturuyoruz
            var cartItem = new CartItem
            {
                CustomerId = customerId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            };
            await _cartItemRepository.AddAsync(cartItem);
        }

        await _cartItemRepository.SaveChangesAsync();
    }

    public async Task<bool> UpdateCartItemAsync(int customerId, int cartItemId, UpdateCartItemDto dto)
    {
        var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
        if (cartItem == null) return false;

        // bu satır gerçekten bu müşteriye mi ait
        if (cartItem.CustomerId != customerId)
            throw new UnauthorizedAccessException("Bu sepet satırını güncelleme yetkiniz bulunmamaktadır.");

        cartItem.Quantity = dto.Quantity;

        await _cartItemRepository.UpdateAsync(cartItem);
        await _cartItemRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveCartItemAsync(int customerId, int cartItemId)
    {
        var cartItem = await _cartItemRepository.GetByIdAsync(cartItemId);
        if (cartItem == null) return false;

        if (cartItem.CustomerId != customerId)
            throw new UnauthorizedAccessException("Bu sepet satırını silme yetkiniz bulunmamaktadır.");

        await _cartItemRepository.DeleteAsync(cartItem); // GenericRepository zaten soft-delete yapıyor (IsDeleted = true)
        await _cartItemRepository.SaveChangesAsync();
        return true;
    }
}