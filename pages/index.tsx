import { useMemo } from 'react'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { getConfig } from '@bigcommerce/storefront-data-hooks/api'
import getAllProducts from '@bigcommerce/storefront-data-hooks/api/operations/get-all-products'
import getSiteInfo from '@bigcommerce/storefront-data-hooks/api/operations/get-site-info'
import getAllPages from '@bigcommerce/storefront-data-hooks/api/operations/get-all-pages'
import rangeMap from '@lib/range-map'
import { Layout } from '@components/core'
import { Grid, Marquee, Hero } from '@components/ui'
import { ProductCard } from '@components/product'
import HomeAllProductsGrid from '@components/core/HomeAllProductsGrid'
import firebase from 'firebase'

const firebaseConfig = {
  apiKey: "AIzaSyCUSCJSej37Ronl9qwL7nTHeGpANXWtFm4",
  authDomain: "pilardecotest.firebaseapp.com",
  databaseURL: "https://pilardecotest.firebaseio.com",
  projectId: "pilardecotest",
  storageBucket: "pilardecotest.appspot.com",
  messagingSenderId: "870066878275",
  appId: "1:870066878275:web:fc89df24f1f05f45c021f6",
  measurementId: "G-PYLT95N95Z"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const DB = firebase.database()
const productos = DB.ref('productos')

const firebaseLo = (snapshot: any) => {
  const data: any = [];
  snapshot.forEach((childSnapshot: any)=>{
      data.push({
          ...childSnapshot.val(),
          id:childSnapshot.key
      })
  })
  return data
}

export async function getStaticProps({
  preview,
  locale,
}: GetStaticPropsContext) {
  const config = getConfig({ locale })

  const snapshotFb = await productos.once('value')
  const productosFb = firebaseLo(snapshotFb)
  const { products } = await getAllProducts({
    variables: { field: 'featuredProducts', first: 6 },
    config,
    preview,
  })
  const featuredProducts = products.map((prod, i) => ({
    ...prod, 
    node: { 
      ...prod.node, 
      name: productosFb[i].titulo, 
      prices: {
        ...prod.node.prices, 
        price: {
          ...prod.node.prices.price, 
          value: productosFb[i].precio
        }
      },
      images: {
        ...prod.node.images,
        edges: [{node: {...prod.node.images.edges[0].node, urlOriginal: productosFb[i].imagen}}, prod.node.images.edges.slice(1, 10)]
      }
    }
  }))
  const { products: bestSellingProducts } = await getAllProducts({
    variables: { field: 'bestSellingProducts', first: 6 },
    config,
    preview,
  })
  const { products: newestProducts } = await getAllProducts({
    variables: { field: 'newestProducts', first: 12 },
    config,
    preview,
  })
  const { categories, brands } = await getSiteInfo({ config, preview })
  const { pages } = await getAllPages({ config, preview })

  return {
    props: {
      featuredProducts,
      bestSellingProducts,
      newestProducts,
      categories,
      brands,
      pages,
    },
    revalidate: 10,
  }
}

const nonNullable = (v: any) => v

export default function Home({
  featuredProducts,
  bestSellingProducts,
  newestProducts,
  categories,
  brands,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { featured, bestSelling } = useMemo(() => {
    // Create a copy of products that we can mutate
    const products = [...newestProducts]
    // If the lists of featured and best selling products don't have enough
    // products, then fill them with products from the products list, this
    // is useful for new commerce sites that don't have a lot of products
    return {
      featured: rangeMap(6, (i) => featuredProducts[i] ?? products.shift())
        .filter(nonNullable)
        .sort((a, b) => a.node.prices.price.value - b.node.prices.price.value)
        .reverse(),
      bestSelling: rangeMap(
        6,
        (i) => bestSellingProducts[i] ?? products.shift()
      ).filter(nonNullable),
    }
  }, [newestProducts, featuredProducts, bestSellingProducts])

  return (
    <div>
      <Grid>
        {featured.slice(0, 3).map(({ node }, i) => (
          <ProductCard
            key={node.path}
            product={node}
            // The first image is the largest one in the grid
            imgWidth={i === 0 ? 1600 : 820}
            imgHeight={i === 0 ? 1600 : 820}
            priority
          />
        ))}
      </Grid>
      <Marquee variant="secondary">
        {bestSelling.slice(3, 6).map(({ node }) => (
          <ProductCard
            key={node.path}
            product={node}
            variant="slim"
            imgWidth={320}
            imgHeight={320}
          />
        ))}
      </Marquee>
      <Hero
        headline="Release Details: The Yeezy BOOST 350 V2 ‘Natural'"
        description="
        The Yeezy BOOST 350 V2 lineup continues to grow. We recently had the
        ‘Carbon’ iteration, and now release details have been locked in for
        this ‘Natural’ joint. Revealed by Yeezy Mafia earlier this year, the
        shoe was originally called ‘Abez’, which translated to ‘Tin’ in
        Hebrew. It’s now undergone a name change, and will be referred to as
        ‘Natural’."
      />
      <Grid layout="B">
        {featured.slice(3, 6).map(({ node }, i) => (
          <ProductCard
            key={node.path}
            product={node}
            // The second image is the largest one in the grid
            imgWidth={i === 1 ? 1600 : 820}
            imgHeight={i === 1 ? 1600 : 820}
          />
        ))}
      </Grid>
      <Marquee>
        {bestSelling.slice(0, 3).map(({ node }) => (
          <ProductCard
            key={node.path}
            product={node}
            variant="slim"
            imgWidth={320}
            imgHeight={320}
          />
        ))}
      </Marquee>
      <HomeAllProductsGrid
        categories={categories}
        brands={brands}
        newestProducts={newestProducts}
      />
    </div>
  )
}

Home.Layout = Layout
