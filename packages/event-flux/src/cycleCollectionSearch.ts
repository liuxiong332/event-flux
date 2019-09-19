import { AnyStoreDeclarer } from './StoreDeclarer';

interface StoreVisit {
  storeKey: string;
  isVisit: boolean;
}

type StoreVisits  = { [storeKey: string]: boolean };

type StoreMapDeclarer = { [storeKey: string]: AnyStoreDeclarer };

function depthSearchStore(
  storeKey: string, 
  storeVisits: StoreVisits, 
  storeMap: StoreMapDeclarer, 
  visitStoreList: string[], 
  visitStoreSet: Set<string>, 
  cycleDepList: { [key: string]: Set<string> }
) {
  storeVisits[storeKey] = true;
  visitStoreList.push(storeKey);
  visitStoreSet.add(storeKey);
  let depNames = storeMap[storeKey].depStoreNames || [];

  for (let depName of depNames) {
    // We encounter the depName that has in the visit store list.
    if (visitStoreSet.has(depName)) {
      let namePos = visitStoreList.indexOf(depName);
      let visits = visitStoreList.slice(namePos).sort();
      let cycleKey = visits.join(",");
      if (!cycleDepList[cycleKey]) {
        cycleDepList[cycleKey] = new Set<string>(visits);
      }
      continue;
    }
    if (storeVisits[depName]) continue;
    depthSearchStore(depName, storeVisits, storeMap, visitStoreList, visitStoreSet, cycleDepList);
  }
  visitStoreList.pop();
  visitStoreSet.delete(storeKey);
  storeVisits[storeKey] = false;
}

export default function searchCycleCollection(storeMap: StoreMapDeclarer) {
  let storeVisits: { [storeKey: string]: boolean } = {};
  for (let storeKey in storeMap) {
    storeVisits[storeKey] = false;
  }

  let cycleDepList: { [key: string]: Set<string> } = {};
  for (let storeKey in storeMap) {
    if (!storeVisits[storeKey]) {
      depthSearchStore(storeKey, storeVisits, storeMap, [], new Set<string>(), cycleDepList);
    }
  }
  return Object.values(cycleDepList);
}