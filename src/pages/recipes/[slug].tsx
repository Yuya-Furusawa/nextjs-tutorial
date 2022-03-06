import * as React from 'react';
import { GetStaticProps } from 'next';
import { sanityClient, urlFor, usePreviewSubscription, PortableText } from '../../../lib/sanity';

const recipeQuery = `*[_type == "recipe" && slug.current == $slug][0]{
  _id,
  name,
  slug,
  mainImage,
  ingredient[]{
    unit,
    wholeNumber,
    fraction,
    ingredient->{
      name
    }
  },
  instructions,
  likes
}`;

type Props = {
  data: {
    recipe: Recipe;
  };
  preview: boolean;
};

type Recipe = {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  mainImage: string;
  ingredient: {
    _key: string;
    wholeNumber: number;
    fraction: string;
    unit: string;
    ingredient: {
      name: string;
    };
  }[];
  instructions: string;
  likes: number;
}

const OneRecipe: React.FC<Props> = ({ data, preview }) => {
  if (!data) return <div>Loading...</div>;
  const { data: { recipe } } = usePreviewSubscription(recipeQuery, {
    params: { slug: data.recipe?.slug.current },
    initialData: data,
    enabled: preview,
  })
  const [likes, setLikes] = React.useState<number>(recipe?.likes);
  const addLike = async () => {
    const res = await fetch("/api/handle-like", {
      method: "POST",
      body: JSON.stringify({ _id: recipe._id }),
    });
    const data = await res.json();
    setLikes(data.likes);
  };

  return (
    <article className='recipe'>
      <h1>{recipe.name}</h1>
      <button className='like-button' onClick={addLike}>
        {likes} ♡
      </button>
      <main className='content'>
        <img src={urlFor(recipe?.mainImage).url()} alt={recipe.name} />
        <div className='breakdown'>
          <ul className='ingredients'>
            {recipe.ingredient?.map((ingredient) => (
              <li key={ingredient._key} className='ingredient'>
                {ingredient?.wholeNumber}
                {ingredient?.fraction}
                {ingredient?.unit}
                <br />
                {ingredient?.ingredient?.name}
              </li>
            ))}
          </ul>
          <PortableText blocks={recipe?.instructions} className="instructions" />
        </div>
      </main>
    </article>
  );
};

export const getStaticPaths = async () => {
  const paths = await sanityClient.fetch(
    `*[_type == "recipe" && defined(slug.current)]{
      "params": {
        "slug": slug.current
      }
    }`
  );
  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const recipe = await sanityClient.fetch(recipeQuery, { slug });
  return {
    props: {
      data: { recipe },
      preview: true,
    }
  }
};

export default OneRecipe;
