import { Slot, $, component$, useComputed$, useSignal, useStore } from '@builder.io/qwik';
import { type DocumentHead, Link, routeLoader$, useLocation } from '@builder.io/qwik-city';
import { Modal } from '~/components/shared';
import { getSmallPokemons } from '~/helpers/get-small-pokemons';
import type { SmallPokemon } from '~/interfaces';
import { PokemonImage } from '~/components/pokemons/pokemon-image';

export const usePokemonList = routeLoader$<SmallPokemon[]>(async({query, redirect, pathname})=> {
  const offset = Number(query.get('offset' || '0'));  
  if (isNaN(offset) || offset < 0) redirect(301, pathname);
    
  const pokemons = await getSmallPokemons(offset, 10);
  console.log(pokemons);
  return pokemons;

    // const resp = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=$10&offset=${ offset }`);
    // const data = await resp.json() as PokemonListResponse
    // return data.results;
});

export default component$(() => {

  const pokemons = usePokemonList();
  const location = useLocation()

  const modalVisible = useSignal(false);
  const modalPokemon = useStore({
    id: '',
    name: ''
  });
  
  const showModal = $(( id: string, name: string ) => {
    modalPokemon.id = id;
    modalPokemon.name = name;

    modalVisible.value = true;
  })

  const closeModal = $(() => {
    modalVisible.value = false;
  })

  const currentOffset = useComputed$<number>(() => {
    const offsetString = new URLSearchParams(location.url.search );
    return Number(offsetString.get('offset'));
  })
  
  // console.log(location.url.searchParams.get('offset'));

  return (
    <>
      <div class="flex flex-col">
        <span class="my-5 text-5xl">Status</span>
        <span>Offset: { currentOffset }</span>
        <span>Está cargando página: { location.isNavigating ? 'Si': 'No' }</span>
      </div>

      <div class="mt-10">
        <Link href={ `/pokemons/list-ssr/?offset=${ currentOffset.value - 10 }` }
              class="btn btn-primary mr-2">
            Anteriores
        </Link>

        <Link href={ `/pokemons/list-ssr/?offset=${ currentOffset.value + 10 }` }
              class="btn btn-primary mr-2">
          Siguientes
        </Link>
      </div>

      <div class="grid grid-cols-6 mt-5">        
        {          
            pokemons.value.map(({ name, id }) =>(
              <div key={ name } 
                  onClick$={() => showModal(id, name) }
                  class="m-5 flex flex-col justify-center items-center">
                  <PokemonImage id={id} />
                  <span class="capitalize">{ name }</span>
              </div>       
            ))          
        }
        
      </div>
      
        <Modal 
          persistent={true}          
          showModal={modalVisible.value}
          closeFn={closeModal} >
          <div q:slot='title'>{ modalPokemon.name }</div>
          
          <div q:slot='content' class="flex flex-col justify-center items-center">
            <PokemonImage id={ modalPokemon.id } />
          
            <span>Preguntandole a ChatGPT</span>

          </div>
        </Modal>

    </>
  )
});

export const head: DocumentHead = {
  title: 'List SSR',  
};