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
  instructions
}`;

type Props = {
  data: {
    recipe: Recipe;
  }
};

type Recipe = {
  name: string;
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
}

const OneRecipe: React.FC<Props> = ({ data }) => {
  const { recipe } = data;
  return (
    <article className='recipe'>
      <h1>{recipe.name}</h1>
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
    props: { data: { recipe } }
  }
};

export default OneRecipe;
