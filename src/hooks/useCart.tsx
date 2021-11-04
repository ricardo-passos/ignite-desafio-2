import { createContext, ReactNode, useContext, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '../services/api'
import { Product, Stock } from '../types'

interface CartProviderProps {
  children: ReactNode
}

interface UpdateProductAmount {
  productId: number
  amount: number
}

interface CartContextData {
  cart: Product[]
  addProduct: (productId: number) => Promise<void>
  removeProduct: (productId: number) => void
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart)
    }

    return []
  })

  const addProduct = async (productId: number) => {
    try {
      // get the stock data first
      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      if (stock.amount <= 0) {
        toast.error('Quantidade solicitada fora de estoque')

        return
      }

      // if it has stock, we can fetch the product and add it to the cart
      const { data: product } = await api.get<Product>(`/products/${productId}`)

      // decrease the product stock amount
      await api.patch<Stock>(`/stock/${productId}`, {
        amount: --stock.amount,
      })

      const previousSavedProducts = localStorage.getItem('@RocketShoes:cart')

      if (previousSavedProducts) {
        const parsePreviousSavedProducts: Product[] = JSON.parse(
          previousSavedProducts
        )

        const duplicatedProductIndex = parsePreviousSavedProducts.findIndex(
          (item) => product.id === item.id
        )

        if (duplicatedProductIndex > -1) {
          const duplicatedProduct = parsePreviousSavedProducts.find(
            (item) => product.id === item.id
          ) as Product

          const updatedAmount = [...parsePreviousSavedProducts]
          updatedAmount.splice(duplicatedProductIndex, 1, {
            ...product,
            amount: ++duplicatedProduct.amount,
          })

          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify(updatedAmount)
          )

          setCart(updatedAmount)

          return
        }

        localStorage.setItem(
          '@RocketShoes:cart',
          JSON.stringify([
            ...parsePreviousSavedProducts,
            { ...product, amount: 1 },
          ])
        )

        setCart([...parsePreviousSavedProducts, { ...product, amount: 1 }])

        return
      }

      localStorage.setItem(
        '@RocketShoes:cart',
        JSON.stringify([{ ...product, amount: 1 }])
      )

      setCart([{ ...product, amount: 1 }])

      return
    } catch {
      toast.error('Erro na adição do produto')
      return
    }
  }

  const removeProduct = (productId: number) => {
    try {
      const savedProducts = [...cart]
      const productIndex = savedProducts.findIndex(
        (product) => product.id === productId
      )

      if (productIndex >= 0) {
        savedProducts.splice(productIndex, 1)
        setCart(savedProducts)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(savedProducts))
      } else {
        throw new Error()
      }
    } catch {
      toast.error('Erro na remoção do produto')

      return
    }
  }

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return
      }

      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      if (stock.amount <= 0) {
        toast.error('Quantidade solicitada fora de estoque')

        return
      }

      const updatedCart = [...cart]
      const productExists = updatedCart.find(
        (product) => product.id === productId
      )

      if (productExists) {
        productExists.amount = amount
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      } else {
        throw new Error()
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto')

      return
    }
  }

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextData {
  const context = useContext(CartContext)

  return context
}
