import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ProductForm } from '@/components/ProductForm'
import { getProductById, updateProduct } from '@/services/products'
import { Product } from '@/types/product'

export default function EditProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (id) {
      getProductById(id).then(setProduct)
    }
  }, [id])

  if (!product) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Editar Produto</h1>
      <ProductForm
        product={product}
        onSubmit={(data) => updateProduct(id!, data)}
      />
    </div>
  )
}
